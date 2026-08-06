import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import * as bl from "../bl";
import { BankingState, groqModel } from "./agent";
import { interrupt } from "@langchain/langgraph";
import { mcpClient } from "../mcp";
import { CallToolResult } from "@modelcontextprotocol/server";
import { parseToolResult } from "../utils";

export const agentNode = async (state: typeof BankingState.State) => {
  const { messages, language } = state;
  const systemPrompt = new SystemMessage(`
  You are a banking assistant for a money transfer application.
  Answer in ${language}.
  Be concise and professional.
  Never invent facts or user information.
  If you don't have enough information to answer a request, ask the user for the missing details.
  Currency: ₪.`);

  const response = await groqModel.invoke([systemPrompt, ...messages]);
  return { messages: [response] };
};

export const routerNode = async (state: typeof BankingState.State) => {
  if (state.pendingAction === "transfer") {
    return {
      route: "transferExtractor",
    };
  }

  const lastMessage = String(state.messages.at(-1)?.content ?? "");

  const response = await groqModel.invoke([
    new SystemMessage(`
    You are a router for a banking assistant.
    Choose EXACTLY ONE route.

    Routes:
    - balance
    - transactions
    - pendingTransactions
    - transferExtractor
    - agent

    Rules:
    - "balance" → balance questions.
    - "transactions" → completed/history transactions.
    - "pendingTransactions" → pending/waiting transactions.
    - "transferExtractor" → sending money.
    - "agent" → greetings, questions, anything else.
    The user may speak Hebrew or English.
    Return ONLY one word.
`),
    new HumanMessage(lastMessage),
  ]);

  const route = String(response.content).trim();

  return { route };
};
export const translateHistoryNode = async (
  state: typeof BankingState.State,
) => {
  const last = state.messages.at(-1);

  if (!last) {
    return {};
  }

  const response = await groqModel.invoke(`
  You are a translator.

  Translate ONLY the assistant's reply.

  Rules:
  - Return ONLY the translated text.
  - Never answer the user.
  - Never explain.
  - Never add notes.
  - Preserve emails.
  - Preserve dates.
  - Preserve currency symbols.
  - Preserve numbers.
  - If the text is already in ${state.language}, return it unchanged.
  `);

  return {
    messages: [new AIMessage(String(response.content))],
  };
};

export const balanceNode = async (state: typeof BankingState.State) => {
  try {
    const result = await mcpClient.callTool({
      name: "get_balance",
      arguments: { userId: state.userId },
    });
    const balance = parseToolResult<number>(result as CallToolResult);
    return {
      messages: [
        new AIMessage(
          `${state.language === "en" ? "Your balance is" : "היתרה שלך"} ₪${balance}.`,
        ),
      ],
    };
  } catch (error) {
    return {
      messages: [
        new AIMessage(
          `Error fetching balance: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        ),
      ],
    };
  }
};

export const transactionsNode = async (state: typeof BankingState.State) => {
  try {
    const result = await mcpClient.callTool({
      name: "get_transactions",
      arguments: { userId: state.userId },
    });
    const data = parseToolResult<string[]>(result as CallToolResult);

    if (!data || data.length === 0) {
      return new AIMessage(
        `${state.language === "en" ? "No transactions found for the user." : "לא נמצאו עסקאות עבור המשתמש."}`,
      );
    }

    return {
      messages: [
        new AIMessage(
          `${state.language === "en" ? "Your transactions are " : "העסקאות שלך"}: ${data}`,
        ),
      ],
    };
  } catch (error) {
    return {
      messages: [
        new AIMessage(
          `Error fetching transactions: ${error instanceof Error && error.message}`,
        ),
      ],
    };
  }
};

export const pendingTransactionsNode = async (
  state: typeof BankingState.State,
) => {
  try {
    const { data } = await bl.getAllTransactionsByUser(
      state.userId,
      1,
      20,
      "PENDING",
    );
    if (!data || data.length === 0) {
      return {
        messages: [
          new AIMessage(
            `${state.language === "en" ? "No transactions for this user" : "אין עסקאות עבור משתמש זה"}`,
          ),
        ],
      };
    }
    const message = data
      .map(({ createdAt, receiver, senderId, amount, message }) => {
        if (senderId === state.userId) {
          return `•${createdAt.toLocaleDateString()}
                    •${receiver.fullName}
                    •${message}
                    •- ${amount}
            `;
        } else {
          return `•${createdAt.toLocaleDateString()}
                        •${message}
                        •${amount}`;
        }
      })
      .join("\n\n");
    return {
      messages: [new AIMessage(`${message}`)],
    };
  } catch (error) {
    return {
      messages: [
        new AIMessage(
          `Error fetching pending transactions: ${error instanceof Error && error.message}`,
        ),
      ],
    };
  }
};

export const transaferMoneyNode = async (state: typeof BankingState.State) => {
  if (state.amount === null || state.amount <= 0) {
    return {
      messages: [
        new AIMessage(
          `${state.language === "en" ? "How much would you like to transfer?" : "כמה תרצה להעביר?"}`,
        ),
      ],
    };
  }
  if (state.recipientEmail === null || state.recipientEmail.trim() === "") {
    return {
      messages: [
        new AIMessage(
          `${state.language === "en" ? "Please provide the recipient's email." : "אנא ספק את הדואל של המקבל."}`,
        ),
      ],
    };
  }

  const recipient = await bl.getUserByEmail(state.recipientEmail);

  if (!recipient) {
    return {
      messages: [
        new AIMessage(
          `${state.language === "en" ? `No account found for "${state.recipientEmail}".` : `לא נמצא חשבון עבור "${state.recipientEmail}".`}`,
        ),
      ],
    };
  }

  const approved = interrupt({
    type: "confirm_transfer",
    recipientEmail: state.recipientEmail,
    amount: state.amount,
    note: state.message,
    message: `${state.language === "en" ? `Do you want to transfer ₪${state.amount} to ${recipient.fullName}?` : `האם אתה רוצה להעבר את ₪${state.amount} ל-${recipient.fullName}?`}`,
  });

  if (approved === "cancel") {
    return {
      pendingAction: null,
      recipientEmail: null,
      amount: null,
      message: null,
      messages: [
        new AIMessage(
          `${state.language === "en" ? "Transfer cancelled." : "ההעברה בוטלה."}`,
        ),
      ],
    };
  }

  try {
    await bl.createTransaction(
      state.userId,
      "",
      state.recipientEmail,
      state.amount,
    );

    return {
      pendingAction: null,
      recipientEmail: null,
      amount: null,
      message: null,
      messages: [
        new AIMessage(
          `${state.language === "en" ? "Transfer completed successfully." : "ההעברה הושלמה בהצלחה."}`,
        ),
      ],
    };
  } catch (error) {
    return {
      pendingAction: null,
      recipientEmail: null,
      amount: null,
      message: null,
      messages: [
        new AIMessage(
          `${state.language === "en" ? "Transfer failed." : "ההעברה נכשלה."}`,
        ),
      ],
    };
  }
};
