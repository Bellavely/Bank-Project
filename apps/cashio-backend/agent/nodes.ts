import { AIMessage } from "@langchain/core/messages";
import * as bl from "../bl";
import { BankingState } from "./agent";
import { interrupt } from "@langchain/langgraph";

export const balanceNode = async (state: typeof BankingState.State) => {
  try {
    const { balance } = await bl.getBalance(state.userId);

    return {
      messages: [new AIMessage(`₪${balance}.`)],
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

export const routerNode = async (state: typeof BankingState.State) => {
  const text = String(state.messages.at(-1)?.content ?? "").toLowerCase();

  if (text.includes("balance") || text.includes("יתרה")) {
    return { route: "balance" };
  }

  if (text.includes("pending") || text.includes("ממתינות")) {
    return { route: "pendingTransactions" };
  }

  if (text.includes("transactions") || text.includes("טרנזקציות")) {
    return { route: "transactions" };
  }

  return { route: "agent" };
};

export const transactionsNode = async (state: typeof BankingState.State) => {
  try {
    const { data } = await bl.getAllTransactionsByUser(state.userId, 1);
    if (!data || data.length === 0) {
      return new AIMessage("No transactions found for the user.");
    }
    const message = data
      .map(({ senderId, createdAt, amount, status, receiver }) => {
        if (senderId === state.userId) {
          return `
          •${createdAt.toLocaleDateString()} 
          • - ₪${amount}
          •${status}
          •${receiver.fullName}`;
        }
        return `•${createdAt.toLocaleDateString()} 
                • ₪${amount} 
                • ${status}`;
      })
      .join("\n\n");
    return { messages: [new AIMessage(`your transaction : ${message}`)] };
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
        messages: [new AIMessage(`No transactions for this user`)],
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

// const sumTransactionsTool = async ({
//   userId,
//   direction,
// }: {
//   userId: string;
//   direction: string;
// }) => {
//   const transactions = (
//     await bl.getAllTransactionsByUser(userId, 1, 100000, "COMPLETED")
//   ).data;
//   let filterFn: (t: any) => boolean;
//   if (direction === "send") {
//     filterFn = (t) => String(t.senderId) === String(userId);
//   } else {
//     filterFn = (t) => String(t.reciverId) === String(userId);
//   }

//   const filteredTransactions = transactions.filter(filterFn);
//   const total = filteredTransactions.reduce(
//     (acc, t) => acc + Number(t.amount),
//     0,
//   );

//   return JSON.stringify({
//     direction,
//     totalSum: total.toFixed(2),
//   });
// };

export const transaferMoneyNode = async (state: typeof BankingState.State) => {
  if (!state.recipientEmail) {
    return {
      messages: [new AIMessage("Please provide the recipient's email.")],
    };
  }

  if (!state.amount) {
    return {
      messages: [new AIMessage("How much would you like to transfer?")],
    };
  }

  const recipient = await bl.getUserByEmail(state.recipientEmail);

  if (!recipient) {
    return `No account found for "${state.recipientEmail}". Ask the user to double-check and re-enter the recipient's email address.`;
  }

  const approved = interrupt({
    type: "confirm_transfer",
    recipientEmail: state.recipientEmail,
    amount: state.amount,
    note: state.message,
  });
  if (!approved) {
    return "Transfer cancelled.";
  }
  const result = await bl.createTransaction(
    state.userId,
    state.message ?? "",
    state.recipientEmail,
    state.amount,
  );

  return {
    messages: [new AIMessage("Transfer completed successfully.")],
  };
};
