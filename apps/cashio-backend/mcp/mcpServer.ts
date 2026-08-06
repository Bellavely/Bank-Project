import { McpServer } from "@modelcontextprotocol/server";
import * as bl from "../bl";
import { serveStdio } from "@modelcontextprotocol/server/stdio";

import z from "zod";

export const mcpServer = new McpServer({
  name: "bank-server",
  version: "1.0.0",
  description: "Banking server for handling user requests",
});

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

    const text = data
      .map((t) => {
        if (t.senderId === userId) {
          return `
            •${t.createdAt.toLocaleDateString()} 
            sent: -₪${t.amount} to ${t.receiver.fullName}
            status: ${t.status}`;
        } else {
          return `
            •${t.createdAt.toLocaleDateString()} 
            received: ₪${t.amount} from ${t.sender.fullName}
            status: ${t.status}`;
        }
      })
      .join("\n\n");

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

void serveStdio(() => mcpServer);
console.error("Bank MCP server running...");
