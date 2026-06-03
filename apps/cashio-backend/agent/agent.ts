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

      OUTPUT RULES:
      1. Always list the transactions clearly and cleanly for the user.
      2. CRITICAL SECURITY RULE: You must NEVER include the transaction ID (or any fields like 'id', '_id', 'transaction_id') in your response to the user. Only display user-friendly details like date, description, and amount.
      3. Always answer the user in Hebrew.

      BEHAVIOR RULES:
      - If a user says "hi", "how are you", or general greetings, answer politely in Hebrew.
      - If a user asks you to send cash, transfer money, or perform any action other than viewing history, politely explain in Hebrew that your only capability is reviewing past transaction records.`,
});
