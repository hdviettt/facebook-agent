import crypto from "node:crypto";
import axios from "axios";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import type {
  WebhookQueryParams,
  WebhookBody,
  ParsedMessage,
  QuickReply,
} from "../types/facebook.types.js";

const GRAPH_API_URL = "https://graph.facebook.com/v21.0";
const MAX_MESSAGE_LENGTH = 2000;

class FacebookService {
  private pageAccessToken: string;

  constructor() {
    this.pageAccessToken = env.FB_PAGE_ACCESS_TOKEN;
  }

  /**
   * Handle GET /webhook verification from Facebook.
   * Returns the challenge string if valid, null otherwise.
   */
  verifyWebhook(query: WebhookQueryParams): string | null {
    const mode = query["hub.mode"];
    const token = query["hub.verify_token"];
    const challenge = query["hub.challenge"];

    if (mode === "subscribe" && token === env.FB_VERIFY_TOKEN) {
      logger.info("Webhook verified successfully");
      return challenge ?? null;
    }

    logger.warn("Webhook verification failed");
    return null;
  }

  /**
   * Validate incoming webhook signature (X-Hub-Signature-256).
   */
  validateSignature(rawBody: Buffer, signature: string): boolean {
    const expectedSignature =
      "sha256=" +
      crypto
        .createHmac("sha256", env.FB_APP_SECRET)
        .update(rawBody)
        .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Parse messaging events from webhook payload.
   */
  parseWebhookEvents(body: WebhookBody): ParsedMessage[] {
    const messages: ParsedMessage[] = [];

    if (body.object !== "page") return messages;

    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        // Handle text messages
        if (event.message?.text) {
          messages.push({
            senderId: event.sender.id,
            messageText: event.message.text,
            timestamp: event.timestamp,
          });
        }
        // Handle quick reply payloads
        else if (event.message?.quick_reply) {
          messages.push({
            senderId: event.sender.id,
            messageText: event.message.quick_reply.payload,
            timestamp: event.timestamp,
          });
        }
        // Handle postbacks
        else if (event.postback) {
          messages.push({
            senderId: event.sender.id,
            messageText: event.postback.payload,
            timestamp: event.timestamp,
          });
        }
      }
    }

    return messages;
  }

  /**
   * Send a text message to a user. Splits long messages automatically.
   */
  async sendTextMessage(recipientId: string, text: string): Promise<void> {
    const chunks = this.splitMessage(text);

    for (const chunk of chunks) {
      await this.callSendApi(recipientId, { text: chunk });
    }
  }

  /**
   * Show typing indicator.
   */
  async sendTypingOn(recipientId: string): Promise<void> {
    await this.callSenderAction(recipientId, "typing_on");
  }

  /**
   * Hide typing indicator.
   */
  async sendTypingOff(recipientId: string): Promise<void> {
    await this.callSenderAction(recipientId, "typing_off");
  }

  /**
   * Send quick reply buttons.
   */
  async sendQuickReplies(
    recipientId: string,
    text: string,
    replies: QuickReply[]
  ): Promise<void> {
    await this.callSendApi(recipientId, {
      text,
      quick_replies: replies,
    });
  }

  private async callSendApi(
    recipientId: string,
    message: Record<string, unknown>
  ): Promise<void> {
    try {
      await axios.post(
        `${GRAPH_API_URL}/me/messages`,
        {
          recipient: { id: recipientId },
          message,
        },
        {
          params: { access_token: this.pageAccessToken },
        }
      );
    } catch (error: any) {
      logger.error(
        { error: error.response?.data ?? error.message },
        "Failed to send message"
      );
    }
  }

  private async callSenderAction(
    recipientId: string,
    action: string
  ): Promise<void> {
    try {
      await axios.post(
        `${GRAPH_API_URL}/me/messages`,
        {
          recipient: { id: recipientId },
          sender_action: action,
        },
        {
          params: { access_token: this.pageAccessToken },
        }
      );
    } catch (error: any) {
      logger.error(
        { error: error.response?.data ?? error.message },
        `Failed to send action: ${action}`
      );
    }
  }

  private splitMessage(text: string): string[] {
    if (text.length <= MAX_MESSAGE_LENGTH) return [text];

    const chunks: string[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      if (remaining.length <= MAX_MESSAGE_LENGTH) {
        chunks.push(remaining);
        break;
      }

      // Try to split at paragraph, then sentence, then word boundary
      let splitIndex = remaining.lastIndexOf("\n\n", MAX_MESSAGE_LENGTH);
      if (splitIndex === -1 || splitIndex < MAX_MESSAGE_LENGTH / 2) {
        splitIndex = remaining.lastIndexOf(". ", MAX_MESSAGE_LENGTH);
        if (splitIndex !== -1) splitIndex += 1; // include the period
      }
      if (splitIndex === -1 || splitIndex < MAX_MESSAGE_LENGTH / 2) {
        splitIndex = remaining.lastIndexOf(" ", MAX_MESSAGE_LENGTH);
      }
      if (splitIndex === -1) {
        splitIndex = MAX_MESSAGE_LENGTH;
      }

      chunks.push(remaining.substring(0, splitIndex).trim());
      remaining = remaining.substring(splitIndex).trim();
    }

    return chunks;
  }
}

export const facebookService = new FacebookService();
