import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "npx",
  args: ["tsx", "./mcp/mcpServer.ts"],
});

export const mcpClient = new Client({
  name: "bank-backend",
  version: "1.0.0",
});

export const connectToMcpServer = async () => {
  await mcpClient.connect(transport);
  console.log("Connected to MCP server");
};
