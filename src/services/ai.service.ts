import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { supabaseService } from "./supabase.service.js";
import { toolDefinitions } from "../tools/definitions.js";
import { getToolHandler } from "../tools/index.js";
import type { ConversationMessage, ToolCallRecord } from "../types/conversation.types.js";

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
   b. Collect: full name (họ tên), phone number (số điện thoại), delivery address (địa chỉ giao hàng).
   c. Summarize the order and ask for explicit confirmation.
   d. Only then call create_order.
6. If you cannot find a product or answer a question, say so honestly and offer to help with something else.
7. Never make up product information. Always use the tools to get real data.
8. Keep responses short (under 500 characters when possible) since this is a chat interface.
9. Format prices in VND (e.g., 189.000đ).
10. If the customer sends a greeting, respond warmly and ask how you can help.`;

class AIService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }

  /**
   * Process a user message and return the AI response.
   */
  async processMessage(senderId: string, messageText: string): Promise<string> {
    // Load conversation history
    const history = await supabaseService.getConversationHistory(senderId);

    // Build messages array
    const messages = this.buildMessages(history, messageText);

    // Run tool loop
    const { responseText, toolCalls } = await this.runToolLoop(messages, senderId);

    // Save conversation
    await supabaseService.saveMessage(senderId, "user", messageText);
    await supabaseService.saveMessage(
      senderId,
      "assistant",
      responseText,
      toolCalls.length > 0 ? toolCalls : undefined
    );

    return responseText;
  }

  /**
   * Build Claude messages from conversation history + new user message.
   */
  private buildMessages(
    history: ConversationMessage[],
    newMessage: string
  ): Anthropic.MessageParam[] {
    const messages: Anthropic.MessageParam[] = [];

    for (const msg of history) {
      if (msg.role === "user") {
        messages.push({ role: "user", content: msg.content });
      } else if (msg.role === "assistant") {
        // If there were tool calls, reconstruct the full exchange
        if (msg.tool_calls && msg.tool_calls.length > 0) {
          // Assistant message with tool_use blocks
          const assistantContent: Anthropic.ContentBlockParam[] = [];
          const toolResults: Anthropic.ToolResultBlockParam[] = [];

          for (const tc of msg.tool_calls) {
            const toolUseId = `toolu_hist_${Math.random().toString(36).slice(2, 11)}`;
            assistantContent.push({
              type: "tool_use",
              id: toolUseId,
              name: tc.name,
              input: tc.input,
            } as Anthropic.ToolUseBlockParam);
            toolResults.push({
              type: "tool_result",
              tool_use_id: toolUseId,
              content: JSON.stringify(tc.result),
            });
          }

          // Add the text response too
          assistantContent.push({
            type: "text",
            text: msg.content,
          } as Anthropic.TextBlockParam);

          messages.push({ role: "assistant", content: assistantContent });
          messages.push({ role: "user", content: toolResults });
        } else {
          messages.push({ role: "assistant", content: msg.content });
        }
      }
    }

    // Add the new user message
    messages.push({ role: "user", content: newMessage });

    return messages;
  }

  /**
   * Tool-use loop: calls Claude, executes tools, repeats until text response.
   */
  private async runToolLoop(
    messages: Anthropic.MessageParam[],
    senderId: string
  ): Promise<{ responseText: string; toolCalls: ToolCallRecord[] }> {
    const allToolCalls: ToolCallRecord[] = [];
    const maxIterations = 10; // Safety limit
    let iterations = 0;

    while (iterations < maxIterations) {
      iterations++;

      const response = await this.anthropic.messages.create({
        model: env.CLAUDE_MODEL,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: toolDefinitions,
        messages,
      });

      logger.debug(
        { stopReason: response.stop_reason, contentBlocks: response.content.length },
        "Claude response"
      );

      // If Claude is done talking, extract text
      if (response.stop_reason === "end_turn") {
        const textBlock = response.content.find(
          (b): b is Anthropic.TextBlock => b.type === "text"
        );
        return {
          responseText: textBlock?.text ?? "Xin lỗi, mình không có phản hồi phù hợp.",
          toolCalls: allToolCalls,
        };
      }

      // If Claude wants to use tools
      if (response.stop_reason === "tool_use") {
        // Append Claude's response to messages
        messages.push({ role: "assistant", content: response.content });

        // Execute each tool call
        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const block of response.content) {
          if (block.type === "tool_use") {
            const handler = getToolHandler(block.name);

            if (!handler) {
              logger.error({ toolName: block.name }, "Unknown tool");
              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: JSON.stringify({ error: `Unknown tool: ${block.name}` }),
                is_error: true,
              });
              continue;
            }

            try {
              logger.info(
                { tool: block.name, input: block.input },
                "Executing tool"
              );

              // Inject senderId for create_order
              const input =
                block.name === "create_order"
                  ? { ...(block.input as Record<string, unknown>), senderId }
                  : block.input;

              const result = await handler(input);

              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: JSON.stringify(result),
              });

              allToolCalls.push({
                name: block.name,
                input: block.input as Record<string, unknown>,
                result,
              });
            } catch (error: any) {
              logger.error(
                { tool: block.name, error: error.message },
                "Tool execution failed"
              );

              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: JSON.stringify({ error: error.message }),
                is_error: true,
              });

              allToolCalls.push({
                name: block.name,
                input: block.input as Record<string, unknown>,
                result: { error: error.message },
              });
            }
          }
        }

        // Append tool results
        messages.push({ role: "user", content: toolResults });
      }
    }

    logger.warn("Tool loop reached max iterations");
    return {
      responseText: "Xin lỗi, mình gặp sự cố khi xử lý yêu cầu. Bạn thử lại nhé!",
      toolCalls: allToolCalls,
    };
  }
}

export const aiService = new AIService();
