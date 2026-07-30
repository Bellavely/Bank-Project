import { ChatGroq } from "@langchain/groq";
import { SystemMessage } from "@langchain/core/messages";
import { StateGraph, Annotation, END, MemorySaver } from "@langchain/langgraph";
import * as dotenv from "dotenv";
import {
  balanceNode,
  routerNode,
  transactionsNode,
  pendingTransactionsNode,
  transaferMoneyNode,
} from "./nodes";

dotenv.config();

export const groqModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY!,
  model: "llama-3.1-8b-instant",
  temperature: 0.2,
  maxTokens: 300,
});

export const BankingState = Annotation.Root({
  messages: Annotation<any[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  language: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "English",
  }),
  userId: Annotation<string>({ reducer: (x, y) => y ?? x, default: () => "" }),
  route: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  recipientEmail: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  amount: Annotation<number>({
    reducer: (_, y) => y,
    default: () => 0,
  }),
  message: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
});

const agentNode = async (state: typeof BankingState.State) => {
  const { messages, language, userId } = state;
  const systemPrompt = new SystemMessage(`
  You are a banking assistant for a money transfer application.
  Answer in ${language}.
  Be concise and professional.
  Never invent facts or user information.
  If the user writes in Hebrew, answer in Hebrew.
  If the user writes in English, answer in English.
  If you don't have enough information to answer a request, ask the user for the missing details.
  Currency: ₪.`);

  const response = await groqModel.invoke([systemPrompt, ...messages]);
  return { messages: [response] };
};

export const translateHistoryNode = async (
  state: typeof BankingState.State,
) => {
  const { messages, language } = state;

  if (!messages || messages.length === 0) return { messages: [] };

  const prompt = `You are a professional translator.
  Translate the following array of chat messages into ${language}.
  Keep the exact same JSON format and keys ("role" and "content").
  Do NOT modify amounts, dates, numbers, or currency symbols.
  Do NOT add markdown formatting like \`\`\`json or any conversational text. Return ONLY the JSON array.

  Messages:
  ${JSON.stringify(messages)}`;

  try {
    const response = await groqModel.invoke(prompt);
    let contentStr = (response.content as string).trim();
    if (contentStr.startsWith("```")) {
      contentStr = contentStr
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }
    const translatedMessages = JSON.parse(contentStr);
    return { messages: translatedMessages };
  } catch (error) {
    console.error("Translation parsing error:", error);
    return { messages };
  }
};

const checkpointer = new MemorySaver();

const workFlow = new StateGraph(BankingState)
  .addNode("router", routerNode)
  .addNode("balance", balanceNode)
  .addNode("agent", agentNode)
  .addNode("transactions", transactionsNode)
  .addNode("pendingTransactions", pendingTransactionsNode)
  .addNode("transferMoney", transaferMoneyNode)
  .addEdge("__start__", "router")
  .addConditionalEdges("router", (state) => state.route, {
    balance: "balance",
    agent: "agent",
    transactions: "transactions",
    pendingTransactions: "pendingTransactions",
    transfer: "transferMoney",
  })
  .addEdge("balance", END)
  .addEdge("transactions", END)
  .addEdge("pendingTransactions", END)
  .addEdge("transferMoney", END)
  .addEdge("agent", END);

export const bankingGraph = workFlow.compile({ checkpointer });

const translateWorkflow = new StateGraph(BankingState)
  .addNode("translate", translateHistoryNode)
  .addEdge("__start__", "translate")
  .addEdge("translate", END);

export const translationGraph = translateWorkflow.compile();
