import { bankingGraph } from "../../agent";
import { Response, Request } from "express";
import { HumanMessage } from "@langchain/core/messages";
import { StatusCodes } from "http-status-codes";
import { Command } from "@langchain/langgraph";

export const chatHandler = async (req: Request, res: Response) => {
  try {
    const { message, currentLanguage } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const { userId } = (req as any).user;

    let result;
    const normalized = message.trim().toLowerCase();

    // Detect if the user is answering a pending transfer confirmation
    const approved = ["yes", "confirm", "ok", "כן", "מאשר"].includes(
      normalized,
    );
    const rejected = ["no", "cancel", "לא", "ביטול"].includes(normalized);

    if (approved || rejected) {
      result = await bankingGraph.invoke(
        new Command({
          resume: approved ? "approve" : "cancel",
        }),
        {
          configurable: {
            thread_id: userId,
          },
        },
      );
    } else {
      result = await bankingGraph.invoke(
        {
          messages: [new HumanMessage(message)],
          language: currentLanguage,
          userId,
        },
        {
          configurable: {
            thread_id: userId,
          },
        },
      );
    }

    // LangGraph paused for confirmation
    const interruptedResult = result as typeof result & {
      __interrupt__?: Array<{
        value: {
          message: string;
        };
      }>;
    };

    if (interruptedResult.__interrupt__) {
      return res.json({
        reply: interruptedResult.__interrupt__[0].value.message,
        waitingForConfirmation: true,
      });
    }

    const finalMessage = result.messages[result.messages.length - 1];

    return res.json({
      reply: finalMessage.content,
      waitingForConfirmation: false,
    });
  } catch (error) {
    console.error("AI Banking Agent Error:", error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "An error occurred while processing the chat message.",
    });
  }
};
