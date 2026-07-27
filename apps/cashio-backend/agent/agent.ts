import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { SystemMessage } from "@langchain/core/messages";
import {
  StateGraph,
  Annotation,
  END,
  interrupt,
  MemorySaver,
} from "@langchain/langgraph";
import * as bl from "../bl";
import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();
const viewTransactions = tool(
  async ({ userId }: { userId: string }) => {
    try {
      const transactions = await bl.getAllTransactionsByUser(userId, 1);
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
    const transactions = await bl.getAllTransactionsByUser(
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
      const balance = await bl.getBalance(userId);
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
      await bl.getAllTransactionsByUser(userId, 1, 100000, "COMPLETED")
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

const transaferMoney = tool(
  async ({
    userId,
    recipientEmail,
    amount,
    message,
  }: {
    userId: string;
    recipientEmail: string;
    amount: number;
    message?: string;
  }) => {
    const recipient = await bl.getUserByEmail(recipientEmail);

    if (!recipient) {
      return `No account found for "${recipientEmail}". Ask the user to double-check and re-enter the recipient's email address.`;
    }

    const approved = interrupt({
      type: "confirm_transfer",
      recipientEmail,
      amount,
      note: message ?? undefined,
      message: message
        ? `Confirm: send ₪${amount.toFixed(2)} to ${recipientEmail} (${recipientEmail}) with the note "${message}"?`
        : `Confirm: send ₪${amount.toFixed(2)} to ${recipientEmail} (${recipientEmail})?`,
    });
    if (!approved) {
      return "Transfer cancelled.";
    }
    const result = await bl.createTransaction(
      userId,
      message ?? "",
      recipientEmail,
      amount,
    );

    return result;
  },
  {
    name: "transferMoney",
    description:
      "Transfer money to a recipient identified by email, with an optional note/message attached to the transaction. Only call this once you have both a recipient email and an amount from the user. If the user didn't mention a note, don't invent one -- just omit it.",
    schema: z.object({
      userId: z.string().describe("The sender's user ID."),
      recipientEmail: z.string().describe("Recipient's email address."),
      amount: z.number().positive().describe("Amount to transfer in ILS."),
      message: z
        .string()
        .max(140)
        .optional()
        .describe(
          "Optional note attached to the transfer, e.g. 'for rent' or 'happy birthday'. Only include if the user actually said something like this.",
        ),
    }),
  },
);

const bankTools = [
  getUsersBalance,
  sumTransactionsTool,
  viewTransactions,
  getAllPendingTransactions,
  transaferMoney,
];

export const groqModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY!,
  model: "llama-3.3-70b-versatile",
  temperature: 0.2,
  maxTokens: 300,
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
  You are a secure banking assistant for a money transfer app.
  User ID: ${userId}
  Answer only in ${language}.

  Capabilities:
  - Check balance and transactions.
  - Calculate totals.
  - Transfer money.

  Rules:
  - Use tools when needed.
  description:
  - Transfer money only when the user explicitly provided a real recipient email address in the conversation. Never use example emails, placeholders, guessed emails, autocomplete, or invented values. If the user did not provide an email, DO NOT call this tool. Ask the user for the recipient email first.  - For transfers, require recipient email and amount.
  - Never guess emails.
  - Only include a transfer note if the user provided one.
  - Do not expose transaction IDs for balance/history requests/transfer.
  - If a transfer is cancelled, do not retry.
  - Keep replies short and clear.
  - Currency: ₪.
  - Always pass user ID to tools.

  TRANSFER SAFETY:
- Never call transferMoney with an invented email.
- Never use placeholders like example@gmail.com.
- The email must appear explicitly in the user's messages.
- If email or balance is missing, ask for it.

  Confirmation:
  - Confirm: yes, confirm, ok, כן, אישור, מאשר.
  - Cancel: no, cancel, לא, ביטול.

  For totals, return only the amount unless details are requested.
  For greetings/goodbyes, reply politely.`);

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

const checkpointer = new MemorySaver();

const workFlow = new StateGraph(BankingState)
  .addNode("agent", agentNode)
  .addNode("tools", new ToolNode(bankTools))
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

export const bankingGraph = workFlow.compile({ checkpointer });

const translateWorkflow = new StateGraph(BankingState)
  .addNode("translate", translateHistoryNode)
  .addEdge("__start__", "translate")
  .addEdge("translate", END);

export const translationGraph = translateWorkflow.compile();
