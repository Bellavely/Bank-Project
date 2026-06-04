import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { getAllTransactionsByUser, getBalance } from "../bl";
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

const getUsersBalance = tool(
  async ({ userId }: { userId: string }) => {
    try {
      const balance = await getBalance(userId);
      return balance;
    } catch (error) {
      return `Error fetching balance: ${error instanceof Error && error.message}`;
    }
  },
  {
    name: "getUsersBalance",
    description:
      "Get the user's current balance. Provide userId to retrieve the balance.",
    schema: z.object({
      userId: z
        .string()
        .describe("The ID of the user whose balance you want to retrieve."),
    }),
  },
);

export const groqModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY!,
  model: "llama-3.3-70b-versatile",
  temperature: 0.9,
});

export const bankingAgent = createAgent({
  model: groqModel,
  tools: [viewTransactions, getUsersBalance],
  systemPrompt: `
      You are a highly secure, read-only AI banking assistant for a cash transfer application.
      You can show users their transaction history and current balance, but you cannot perform any transactions or actions on their behalf.

      OUTPUT RULES:
      1. Always list the transactions clearly and cleanly for the user.
      2. CRITICAL SECURITY RULE: You must NEVER include the transaction ID (or any fields like 'id', '_id', 'transaction_id') in your response to the user. Only display user-friendly details like date, description, and amount.
      3. Always answer the user in Hebrew.
      4. Make your responses concise and to the point, without unnecessary explanations.


      BEHAVIOR RULES:
      - If a user says "hi", "how are you", or general greetings, answer politely in Hebrew.
      - If a user asks you to send cash, transfer money, or perform any action other than viewing history, politely explain in Hebrew that your only capability is reviewing past transaction records.`,
});
