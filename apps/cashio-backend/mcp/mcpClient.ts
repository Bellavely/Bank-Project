import path from "path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const isProduction = process.env.NODE_ENV === "production";

const transport = new StdioClientTransport({
  command: isProduction ? "node" : "npx",
  args: isProduction
    ? [path.join(process.cwd(), "dist", "mcp", "mcpServer.js")]
    : ["tsx", "./mcp/mcpServer.ts"],
});

export const mcpClient = new Client({
  name: "bank-backend",
  version: "1.0.0",
});

export const connectToMcpServer = async () => {
  try {
    await mcpClient.connect(transport);
    console.log("Connected to MCP server");
  } catch (error) {
    console.error("Failed to connect to MCP server:", error);
  }
};
