import { bankingGraph, translationGraph } from "../../agent";
import { Response, Request } from "express";
import { HumanMessage } from "@langchain/core/messages";
import { StatusCodes } from "http-status-codes";

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
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "An error occurred while processing the chat message.",
    });
  }
};

export const translateHistory = async (req: Request, res: Response) => {
  const { messages, targetLanguage } = req.body;
  try {
    const result = await translationGraph.invoke({
      messages: messages,
      language: targetLanguage,
    });
    res.json({ messages: result.messages });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Translation Graph failed" });
  }
};
