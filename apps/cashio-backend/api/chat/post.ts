import { bankingGraph } from "../../agent";
import { Response, Request } from "express";
import { HumanMessage } from "@langchain/core/messages";

export const chatHandler = async (req: Request, res: Response) => {
  try {
    const { message, currentLanguage } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const { userId } = (req as any).user;

    const result = await bankingGraph.invoke({
      messages: [new HumanMessage(message)],
      language: currentLanguage,
      userId: userId,
    });

    const finalMessage = result.messages[result.messages.length - 1];

    return res.json({ reply: finalMessage.content });
  } catch (error) {
    console.error("AI Banking Agent Error:", error);
    return res.status(500).json({
      error: "An error occurred while processing the chat message.",
    });
  }
};
