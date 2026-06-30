import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { getAllTransactionsByUser, getBalance } from "../bl";
import { z } from "zod";
import * as dotenv from "dotenv";
import { send } from "node:process";
import { Transaction } from "@prisma/client";

dotenv.config();
const viewTransactions = tool(
  async ({ userId }: { userId: string }) => {
    try {
      const transactions = await getAllTransactionsByUser(userId, 1);
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

const sumTransactionsTool = tool(
  async ({ userId, direction }: { userId: string; direction: string }) => {
    const transactions = (await getAllTransactionsByUser(userId, 1)).data;
    let filterFn: (t: any) => boolean;
    if (direction === "send") {
      filterFn = (t) => t.senderId === userId;
    } else {
      filterFn = (t) => t.receiverId === userId;
    }
    const filteredTransactions = transactions.filter(filterFn);
    const total = filteredTransactions.reduce(
      (acc, t) => acc + Number(t.amount),
      0,
    );

    return `The total sum of money ${direction === "receive" ? "received" : "sent"} is $${total.toFixed(2)}.`;
  },
  {
    name: "sum_transactions",
    description:
      "Calculates the total sum of money sent or received by the user.",
    schema: z.object({
      direction: z.enum(["send", "receive"]),
    }),
  },
);
const bankTools = [getUsersBalance, viewTransactions, sumTransactionsTool];
export const groqModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY!,
  model: "llama-3.3-70b-versatile",
  temperature: 0.9,
});

export const bankingAgent = createAgent({
  model: groqModel,
  tools: bankTools,
  systemPrompt: `
You are a highly secure, read-only AI banking assistant for a cash transfer application.
You can show users their transaction history and current balance, but you cannot perform any transactions or actions on their behalf.
You can calculate and sum the total sent or received money from their transactions.

OUTPUT RULES:
1. If the user asks for a calculation or summary (like a total sum or count), ONLY provide the calculated total amount. Do NOT list out the individual transactions unless they explicitly ask to see them.
2. If the user asks to see their transaction history, list the transactions clearly and cleanly.
3. CRITICAL SECURITY RULE: You must NEVER include the transaction ID (or any fields like 'id', 'transaction_id') in your response to the user. Only display user-friendly details like date, description, and amount.
4. Always answer the user in Hebrew.
5. Make your responses concise and to the point, without unnecessary explanations.
6. The currency is Israeli Shekel (₪ / ש"ח).

BEHAVIOR RULES:
- If a user says "hi", "how are you", or general greetings, answer politely in Hebrew.
- If a user says "bye" or "goodbye" answer politely in Hebrew.`,
});
