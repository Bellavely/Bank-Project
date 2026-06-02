import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { getAllTransactionsByUser } from "../bl";
import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();
const viewTransactions = tool(
  async ({ userId, limit }: { userId: string; limit: number }) => {
    try {
      const transactions = await getAllTransactionsByUser(userId, 1, limit);
      if (!transactions || transactions.length === 0) {
        return "No transactions found for the user.";
      }
      return transactions;
    } catch (error) {
      return `Error fetching transactions: ${error instanceof Error && error.message}`;
    }
  },
  {
    name: "viewTransactions",
    description:
      "View the user's transactions. Provide userId and limit for the number of transactions to retrieve.",
    schema: z.object({
      userId: z
        .string()
        .describe("The ID of the user whose transactions you want to view."),
      limit: z
        .number()
        .describe("The maximum number of transactions to retrieve."),
    }),
  },
);

export const groqModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY!,
  model: "llama-3.3-70b-versatile",
  temperature: 0.9,
});

export const bankingAgent = createAgent({
  model: groqModel, // Parameter renamed from 'llm' to 'model'
  tools: [viewTransactions],
  systemPrompt: `
    You are a highly secure, read-only AI banking assistant for a cash transfer application.
    Your ONLY capability is reading transaction records using the 'viewTransactions' tool.
    Always list the transactions clearly and cleanly for the user.
    If a user asks you to send cash, transfer money, or do anything else, politely explain that you can currently only review past transaction records.
  `,
});
