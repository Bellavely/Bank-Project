import { ChatGroq } from "@langchain/groq";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { StateGraph, Annotation, END, MemorySaver } from "@langchain/langgraph";
import * as dotenv from "dotenv";
import {
  balanceNode,
  transactionsNode,
  pendingTransactionsNode,
  transaferMoneyNode,
  agentNode,
  routerNode,
} from "./nodes";
import z from "zod";

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
  pendingAction: Annotation<string | null>({
    reducer: (_, y) => y,
    default: () => null,
  }),
  recipientEmail: Annotation<string | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),
  amount: Annotation<number | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),
  message: Annotation<string | null>({
    reducer: (_, newValue) => newValue,
    default: () => null,
  }),
});


const TransferSchema = z.object({
  recipientEmail: z.string().nullable(),
  amount: z.number().nullable(),
});

const extractor = groqModel.withStructuredOutput(TransferSchema);
export const transferExtractorNode = async (
  state: typeof BankingState.State,
) => {
  const lastMessage = String(state.messages.at(-1)?.content ?? "");
  const result = await extractor.invoke(`
  You are extracting information for a bank transfer.
  Current transfer state:
  Recipient email: ${state.recipientEmail ?? "missing"}
  Amount: ${state.amount ?? "missing"}
  Note: ${state.message ?? "missing"}
  Latest user message:
  ${lastMessage}
  Extract only NEW information from the latest message.
  If a field is not mentioned, return null.
  Never invent values.
`);

  return {
    pendingAction: "transfer",
    recipientEmail: result.recipientEmail ?? state.recipientEmail,
    amount: result.amount ?? state.amount,
  };
};

const checkpointer = new MemorySaver();

const workFlow = new StateGraph(BankingState)
  .addNode("router", routerNode)
  .addNode("balance", balanceNode)
  .addNode("agent", agentNode)
  .addNode("transactions", transactionsNode)
  .addNode("pendingTransactions", pendingTransactionsNode)
  .addNode("transferExtractor", transferExtractorNode)
  .addNode("transfer", transaferMoneyNode)

  .addEdge("__start__", "router")
  .addConditionalEdges("router", (state) => state.route, {
    balance: "balance",
    agent: "agent",
    transactions: "transactions",
    transferExtractor: "transferExtractor",
    pendingTransactions: "pendingTransactions",
  })
  .addEdge("balance", END)
  .addEdge("transactions", END)
  .addEdge("pendingTransactions", END)
  .addEdge("transferExtractor", "transfer")
  .addEdge("transfer", END)
  .addEdge("agent", END);

export const bankingGraph = workFlow.compile({ checkpointer });
