import OpenAI from "openai";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { toolDefinitions } from "../tools/definitions.js";
import { getToolHandler } from "../tools/index.js";
import type {
  ChatCompletionMessageParam,
  ChatCompletionToolMessageParam,
} from "openai/resources/chat/completions.js";

const SYSTEM_PROMPT = `You are a helpful and friendly customer service assistant for our store.
You help customers browse products, answer questions about items, check stock availability, and place orders.

LANGUAGE: Always respond in Vietnamese unless the customer writes in another language.

BEHAVIOR RULES:
1. Be warm, professional, and concise. Use casual Vietnamese (e.g., "bạn", "mình").
2. When customers ask about products, use the search_products tool to find relevant items.
3. When they want details on a specific product, use get_product_details.
4. When they ask about stock or availability, use check_inventory.
5. Before placing an order, ALWAYS:
   a. Confirm the exact products and quantities with the customer.
   b. Collect: full name (ho ten), phone number (so dien thoai), delivery address (dia chi giao hang).
   c. Summarize the order and ask for explicit confirmation ("ban xac nhan dat hang nhe?").
   d. Only then call create_order.
6. If you cannot find a product or answer a question, say so honestly and offer to help with something else.
7. Never make up product information. Always use the tools to get real data.
8. Keep responses short (under 500 characters when possible) since this is a chat interface.
9. Format prices in VND (e.g., 189.000d).
10. If the customer sends a greeting, respond warmly and ask how you can help.
11. NEVER use markdown formatting (no **, *, #, [], etc). This is a plain text chat. Use plain text only.`;

// In-memory conversation history per sender
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
    // Get or create conversation history
    let history = conversationHistory.get(senderId) ?? [];

    // Add user message
    history.push({ role: "user", content: messageText });

    // Trim if too long
    if (history.length > MAX_HISTORY) {
      history = history.slice(-MAX_HISTORY);
    }

    // Run tool loop
    const responseText = await this.runToolLoop(history, senderId);

    // Save assistant response to history
    history.push({ role: "assistant", content: responseText });
    conversationHistory.set(senderId, history);

    return responseText;
  }

  private async runToolLoop(
    history: ChatCompletionMessageParam[],
    senderId: string
  ): Promise<string> {
    const maxIterations = 10;

    // Working copy of messages for this request (includes tool call/result turns)
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
    ];

    for (let i = 0; i < maxIterations; i++) {
      logger.info({ iteration: i, senderId }, "Calling AI");

      const response = await this.client.chat.completions.create({
        model: env.AI_MODEL,
        max_tokens: 1024,
        messages,
        tools: toolDefinitions,
      });

      const choice = response.choices[0];
      if (!choice) break;

      const message = choice.message;

      // If the model wants to call tools
      if (choice.finish_reason === "tool_calls" && message.tool_calls?.length) {
        // Add assistant message with tool calls to messages
        messages.push(message);

        // Execute each tool call
        for (const toolCall of message.tool_calls) {
          if (toolCall.type !== "function") continue;

          const fnName = toolCall.function.name;
          const handler = getToolHandler(fnName);

          let resultContent: string;
          if (!handler) {
            logger.error({ tool: fnName }, "Unknown tool");
            resultContent = JSON.stringify({ error: `Unknown tool: ${fnName}` });
          } else {
            try {
              const input = JSON.parse(toolCall.function.arguments);
              logger.info({ tool: fnName, input }, "Executing tool");

              // Inject senderId for create_order
              if (fnName === "create_order") {
                input.senderId = senderId;
              }

              const result = await handler(input);
              resultContent = JSON.stringify(result);
            } catch (error: any) {
              logger.error({ tool: fnName, error: error.message }, "Tool failed");
              resultContent = JSON.stringify({ error: error.message });
            }
          }

          // Add tool result
          const toolMessage: ChatCompletionToolMessageParam = {
            role: "tool",
            tool_call_id: toolCall.id,
            content: resultContent,
          };
          messages.push(toolMessage);
        }

        // Continue loop — model will process tool results
        continue;
      }

      // Model is done, return text response
      const text = message.content ?? "Xin lỗi, mình không có phản hồi phù hợp.";
      logger.info({ senderId, responseLength: text.length }, "AI responded");
      return text;
    }

    logger.warn("Tool loop reached max iterations");
    return "Xin lỗi, mình gặp sự cố khi xử lý yêu cầu. Bạn thử lại nhé!";
  }
}

export const aiService = new AIService();
