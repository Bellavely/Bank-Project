import { McpServer } from "@modelcontextprotocol/server";
import * as bl from "../bl";
import { serveStdio } from "@modelcontextprotocol/server/stdio";

import z from "zod";

export const mcpServer = new McpServer({
  name: "bank-server",
  version: "1.0.0",
  description: "Banking server for handling user requests",
});
const mapTransactionsToText = (userId: string, transactions: any[]) => {
  return transactions
    .map((t) => {
      if (t.senderId === userId) {
        return `
            \n •${t.createdAt.toLocaleDateString()} 
            sent: -₪${t.amount} to ${t.receiver.fullName}
            status: ${t.status} \n`;
      } else {
        return `
            \n •${t.createdAt.toLocaleDateString()} 
            received: ₪${t.amount} from ${t.sender.fullName}
            status: ${t.status} \n`;
      }
    })
    .join("\n\n");
};

mcpServer.registerTool(
  "get_balance",
  {
    description: "Returns the user's balance",
    inputSchema: z.object({
      userId: z.string(),
    }),
  },
  async ({ userId }) => {
    const { balance } = await bl.getBalance(userId);

    return {
      content: [
        {
          type: "text",
          text: balance?.toString() ?? "0",
        },
      ],
    };
  },
);

mcpServer.registerTool(
  "get_transactions",
  {
    description: "Returns the user's transactions",
    inputSchema: z.object({
      userId: z.string(),
    }),
  },
  async ({ userId }) => {
    const { data } = await bl.getAllTransactionsByUser(userId, 1);

    const text = mapTransactionsToText(userId, data);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(text ?? ""),
        },
      ],
    };
  },
);

mcpServer.registerTool(
  "get_pending_transactions",
  {
    description: "Returns the user's pending transactions",
    inputSchema: z.object({
      userId: z.string(),
    }),
  },
  async ({ userId }) => {
    const { data } = await bl.getAllTransactionsByUser(
      userId,
      1,
      20,
      "PENDING",
    );
    const text = mapTransactionsToText(userId, data);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(text ?? ""),
        },
      ],
    };
  },
);

mcpServer.registerTool(
  "get_user_by_email",
  {
    description: "Returns user information by email",
    inputSchema: z.object({
      email: z.string().email(),
    }),
  },
  async ({ email }) => {
    const user = await bl.getUserByEmail(email);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(user || null),
        },
      ],
    };
  },
);

mcpServer.registerTool(
  "transfer",
  {
    description: "Transfers money from one user to another",
    inputSchema: z.object({
      senderId: z.string(),
      recipientEmail: z.string().email(),
      amount: z.number().positive(),
    }),
  },
  async ({ senderId, recipientEmail, amount }) => {
    await bl.createTransaction(senderId, "", recipientEmail, amount);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ success: true }),
        },
      ],
    };
  },
);

void serveStdio(() => mcpServer);
console.error("Bank MCP server running...");
