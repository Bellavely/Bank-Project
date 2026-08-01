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

export const transaferMoneyNode = async (state: typeof BankingState.State) => {
  console.log("Transfer Money Node State:", state);
  if (state.amount === null || state.amount <= 0) {
    return {
      messages: [new AIMessage("How much would you like to transfer?")],
    };
  }
  if (state.recipientEmail === null || state.recipientEmail.trim() === "") {
    return {
      messages: [new AIMessage("Please provide the recipient's email.")],
    };
  }

  if (state.message === null || state.message.trim() === "") {
    return {
      messages: [
        new AIMessage("do you want to provide a message for the transfer."),
      ],
    };
  }

  const recipient = await bl.getUserByEmail(state.recipientEmail);

  if (!recipient) {
    return {
      messages: [
        new AIMessage(
          `No account found for "${state.recipientEmail}".
          Double-check and re-enter the recipient's email address.`,
        ),
      ],
    };
  }

  const approved = interrupt({
    type: "confirm_transfer",
    recipientEmail: state.recipientEmail,
    amount: state.amount,
    note: state.message,
    message: `Do you want to transfer ₪${state.amount} to ${recipient.fullName}?`,
  });

  if (approved === "cancel") {
    return {
      pendingAction: null,
      recipientEmail: null,
      amount: null,
      message: null,
      messages: [new AIMessage(`Transfer cancelled.`)],
    };
  }

  await bl.createTransaction(
    state.userId,
    state.message,
    state.recipientEmail,
    state.amount,
  );

  return {
    pendingAction: null,
    recipientEmail: null,
    amount: null,
    message: null,
    messages: [new AIMessage("Transfer completed successfully.")],
  };
};
