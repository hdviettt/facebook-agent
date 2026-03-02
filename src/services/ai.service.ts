import OpenAI from "openai";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions.js";

const SYSTEM_PROMPT = `You are a helpful and friendly customer service assistant for our store.
You help customers browse products, answer questions about items, check stock availability, and place orders.

LANGUAGE: Always respond in Vietnamese unless the customer writes in another language.

BEHAVIOR RULES:
1. Be warm, professional, and concise. Use casual Vietnamese (e.g., "bạn", "mình").
2. If you cannot answer a question, say so honestly and offer to help with something else.
3. Keep responses short (under 500 characters when possible) since this is a chat interface.
4. If the customer sends a greeting, respond warmly and ask how you can help.`;

// In-memory conversation history (per sender) for now
const conversationHistory = new Map<string, ChatCompletionMessageParam[]>();
const MAX_HISTORY = 20;

class AIService {
  private _client: OpenAI | null = null;

  private get client(): OpenAI {
    if (!this._client) {
      if (!env.OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not configured");
      }
      this._client = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: env.OPENROUTER_API_KEY,
      });
    }
    return this._client;
  }

  async processMessage(senderId: string, messageText: string): Promise<string> {
    // Get or create conversation history for this user
    let history = conversationHistory.get(senderId) ?? [];

    // Add user message
    history.push({ role: "user", content: messageText });

    // Trim history if too long
    if (history.length > MAX_HISTORY) {
      history = history.slice(-MAX_HISTORY);
    }

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
    ];

    logger.info({ senderId, messageText }, "Calling AI");

    const response = await this.client.chat.completions.create({
      model: env.AI_MODEL,
      max_tokens: 1024,
      messages,
    });

    const responseText =
      response.choices[0]?.message?.content ??
      "Xin lỗi, mình không có phản hồi phù hợp.";

    // Save assistant response to history
    history.push({ role: "assistant", content: responseText });
    conversationHistory.set(senderId, history);

    logger.info({ senderId, responseLength: responseText.length }, "AI responded");

    return responseText;
  }
}

export const aiService = new AIService();
