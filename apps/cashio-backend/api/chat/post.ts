import { bankingAgent } from "../../agent";
import { Response, Request } from "express";
import { HumanMessage } from "@langchain/core/messages";

export const chatHandler = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const { userId } = (req as any).user;

    const executionContext = `
      [SYSTEM CONTEXT: Authenticated Client ID is "${userId}"]
      User Message: ${message}
    `;

    const graphOutput = await bankingAgent.invoke({
      messages: [new HumanMessage({ content: executionContext })],
    } as any);

    const finalMessage = graphOutput.messages[graphOutput.messages.length - 1];

    return res.json({ reply: finalMessage.content });
  } catch (error) {
    console.error("AI Banking Agent Error:", error); // Added console logging to make debugging easier
    return res.status(500).json({
      error: "An error occurred while processing the chat message.",
    });
  }
};
