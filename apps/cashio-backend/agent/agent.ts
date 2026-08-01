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

const agentNode = async (state: typeof BankingState.State) => {
  const { messages, language } = state;
  const systemPrompt = new SystemMessage(`
  You are a banking assistant for a money transfer application.
  Answer in ${language}.
  Be concise and professional.
  Never invent facts or user information.
  If you don't have enough information to answer a request, ask the user for the missing details.
  Currency: ₪.`);

  const response = await groqModel.invoke([systemPrompt, ...messages]);
  return { messages: [response] };
};

const routerNode = async (state: typeof BankingState.State) => {
  if (state.pendingAction === "transfer") {
    return {
      route: "transferExtractor",
    };
  }

  const lastMessage = String(state.messages.at(-1)?.content ?? "");

  const response = await groqModel.invoke([
    new SystemMessage(`
    You are a router for a banking assistant.
    Choose EXACTLY ONE route.

    Routes:
    - balance
    - transactions
    - pendingTransactions
    - transferExtractor
    - agent

    Rules:
    - "balance" → balance questions.
    - "transactions" → completed/history transactions.
    - "pendingTransactions" → pending/waiting transactions.
    - "transferExtractor" → sending money.
    - "agent" → greetings, questions, anything else.
    The user may speak Hebrew or English.
    Return ONLY one word.
`),
    new HumanMessage(lastMessage),
  ]);

  const route = String(response.content).trim();

  return { route };
};

export const translateHistoryNode = async (
  state: typeof BankingState.State,
) => {
  const last = state.messages.at(-1);

  if (!last) {
    return {};
  }

  const response = await groqModel.invoke(`
  Translate the following text to ${state.language}.
  Keep:
  - emails
  - dates
  - currency in shekels
  - numbers
  Text:
  -dont add notes or explanations
  - if the text is already in ${state.language}, return it as is.
   
  Return ONLY the translated text.
  ${last.content}
`);

  return {
    messages: [new AIMessage(String(response.content))],
  };
};

const TransferSchema = z.object({
  recipientEmail: z.string().nullable(),
  amount: z.number().nullable(),
  message: z.string().nullable(),
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
    message: result.message ?? state.message,
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
  .addNode("translate", translateHistoryNode)

  .addEdge("__start__", "router")
  .addConditionalEdges("router", (state) => state.route, {
    balance: "balance",
    agent: "agent",
    transactions: "transactions",
    transferExtractor: "transferExtractor",
    pendingTransactions: "pendingTransactions",
  })
  .addEdge("balance", "translate")
  .addEdge("transactions", "translate")
  .addEdge("pendingTransactions", "translate")
  .addEdge("transferExtractor", "transfer")
  .addEdge("transfer", END)
  .addEdge("agent", "translate")
  .addEdge("translate", END);

export const bankingGraph = workFlow.compile({ checkpointer });
