import { AIMessage } from "@langchain/core/messages";
import * as bl from "../bl";
import { BankingState } from "./agent";
import { interrupt } from "@langchain/langgraph";

export const balanceNode = async (state: typeof BankingState.State) => {
  try {
    const { balance } = await bl.getBalance(state.userId);
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
    const { data } = await bl.getAllTransactionsByUser(state.userId, 1);
    if (!data || data.length === 0) {
      return new AIMessage(
        `${state.language === "en" ? "No transactions found for the user." : "לא נמצאו עסקאות עבור המשתמש."}`,
      );
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
    return {
      messages: [
        new AIMessage(
          `${state.language === "en" ? "Your transactions are" : "העסקאות שלך"}: ${message}`,
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
