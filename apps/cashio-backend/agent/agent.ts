import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { SystemMessage } from "@langchain/core/messages";
import { StateGraph, Annotation, END } from "@langchain/langgraph";
import { getAllTransactionsByUser, getBalance } from "../bl";
import { z } from "zod";
import * as dotenv from "dotenv";

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

const getAllPendingTransactions = tool(
  async ({ userId }: { userId: string }) => {
    const transactions = await getAllTransactionsByUser(
      userId,
      1,
      20,
      "PENDING",
    );
    if (!transactions || transactions.length === 0) {
      return "No transactions found for the user.";
    }
    return transactions;
  },
  {
    name: "getAllPendingTransactions",
    description:
      "Get the user's pending transactions. Provide userId to retrieve them.",
    schema: z.object({
      userId: z
        .string()
        .describe(
          "The ID of the user whose pending transactions you want to retrieve.",
        ),
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
    const transactions = (
      await getAllTransactionsByUser(userId, 1, 100000, "COMPLETED")
    ).data;
    let filterFn: (t: any) => boolean;
    if (direction === "send") {
      filterFn = (t) => String(t.senderId) === String(userId);
    } else {
      filterFn = (t) => String(t.reciverId) === String(userId);
    }

    const filteredTransactions = transactions.filter(filterFn);
    const total = filteredTransactions.reduce(
      (acc, t) => acc + Number(t.amount),
      0,
    );

    return JSON.stringify({
      direction,
      totalSum: total.toFixed(2),
      currency: "ILS",
    });
  },
  {
    name: "sum_transactions",
    description:
      "Calculates the total sum of money sent or received by the user.",
    schema: z.object({
      userId: z
        .string()
        .describe(
          "The ID of the user whose sum transactions you want to retrieve.",
        ),
      direction: z.enum(["send", "receive"]),
    }),
  },
);
const bankTools = [
  getUsersBalance,
  sumTransactionsTool,
  viewTransactions,
  getAllPendingTransactions,
];
export const groqModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY!,
  model: "openai/gpt-oss-120b",
  temperature: 0.9,
});

export const BankingState = Annotation.Root({
  messages: Annotation<any[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  language: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "English",
  }),
  userId: Annotation<string>({ reducer: (x, y) => y ?? x, default: () => "" }),
});

const agentNode = async (state: typeof BankingState.State) => {
  const { messages, language, userId } = state;
  const systemPrompt = new SystemMessage(`
  You are a highly secure, read-only AI banking assistant for a cash transfer application.
  You can show users their transaction history, pending transactions, and current balance, but you cannot perform any transactions or actions on their behalf.
  You can calculate and sum the total sent or received money from their transactions.
  The current logged-in user ID is: ${userId}.
  OUTPUT RULES:
  1. If the user asks for a calculation or summary (like a total sum or count), ONLY provide the calculated total amount. Do NOT list out the individual transactions unless they explicitly ask to see them.
  2. If the user asks to see their transaction history, list the transactions clearly and cleanly.
  3. CRITICAL SECURITY RULE: You must NEVER include the transaction ID (or any fields like 'id', 'transaction_id') in your response to the user. Only display user-friendly details like date, description, and amount.
  4. CRITICAL LANGUAGE RULE: You MUST answer strictly in ${language}, REGARDLESS of the language the user wrote their message in. Even if the user writes in Hebrew or any other language, process their request but formulate your entire final response ONLY in ${language}.
  5. Make your responses concise and to the point, without unnecessary explanations.
  6. The currency is Israeli Shekel (₪ / ש"ח).
  7. Always pass the user ID "${userId}" as an argument when calling any tool.

  BEHAVIOR RULES:
  - If a user says "hi", "how are you", or general greetings, answer politely in ${language}.
  - If a user says "bye" or "goodbye" answer politely in ${language}.`);

  const modelWithTools = groqModel.bindTools(bankTools);
  const response = await modelWithTools.invoke([systemPrompt, ...messages]);
  return { messages: [response] };
};

const shouldContinue = (state: typeof BankingState.State) => {
  const { messages } = state;

  const lastMessage = messages[messages.length - 1];

  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }
  return END;
};

export const translateHistoryNode = async (
  state: typeof BankingState.State,
) => {
  const { messages, language } = state;

  if (!messages || messages.length === 0) return { messages: [] };

  const prompt = `You are a professional translator.
  Translate the following array of chat messages into ${language}.
  Keep the exact same JSON format and keys ("role" and "content").
  Do NOT modify amounts, dates, numbers, or currency symbols.
  Do NOT add markdown formatting like \`\`\`json or any conversational text. Return ONLY the JSON array.

  Messages:
  ${JSON.stringify(messages)}`;

  try {
    const response = await groqModel.invoke(prompt);
    let contentStr = (response.content as string).trim();
    if (contentStr.startsWith("```")) {
      contentStr = contentStr
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }
    const translatedMessages = JSON.parse(contentStr);
    return { messages: translatedMessages };
  } catch (error) {
    console.error("Translation parsing error:", error);
    return { messages };
  }
};

const workFlow = new StateGraph(BankingState)
  .addNode("agent", agentNode)
  .addNode("tools", new ToolNode(bankTools))
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

export const bankingGraph = workFlow.compile();

const translateWorkflow = new StateGraph(BankingState)
  .addNode("translate", translateHistoryNode)
  .addEdge("__start__", "translate")
  .addEdge("translate", END);

export const translationGraph = translateWorkflow.compile();
