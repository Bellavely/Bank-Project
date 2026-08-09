import { CallToolResult } from "@modelcontextprotocol/server";

export function parseToolResult<T>(result: CallToolResult): T {
  const content = result.content[0];
  if (!content || content.type !== "text") {
    throw new Error("Expected text response");
  }
  return JSON.parse(content.text);
}
