import type { Request, Response } from "express";
import { logger } from "../config/logger.js";
import { facebookService } from "../services/facebook.service.js";
import { aiService } from "../services/ai.service.js";
import type { WebhookQueryParams, WebhookBody } from "../types/facebook.types.js";

/**
 * GET /webhook - Facebook verification
 */
export function verifyWebhook(req: Request, res: Response): void {
  const challenge = facebookService.verifyWebhook(
    req.query as unknown as WebhookQueryParams
  );

  if (challenge) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send("Forbidden");
  }
}

// Per-user processing lock to prevent concurrent message handling
const userLocks = new Map<string, Promise<void>>();

/**
 * POST /webhook - Handle incoming messages
 */
export function handleWebhook(req: Request, res: Response): void {
  // Validate signature
  const signature = req.headers["x-hub-signature-256"] as string;
  if (signature && (req as any).rawBody) {
    if (!facebookService.validateSignature((req as any).rawBody, signature)) {
      logger.warn("Invalid webhook signature");
      res.status(403).send("Invalid signature");
      return;
    }
  }

  // Respond 200 immediately (Facebook requires < 20s)
  res.status(200).send("EVENT_RECEIVED");

  // Process messages asynchronously
  const body = req.body as WebhookBody;
  const messages = facebookService.parseWebhookEvents(body);

  for (const message of messages) {
    const { senderId, messageText } = message;

    // Queue processing per user to prevent race conditions
    const prevLock = userLocks.get(senderId) ?? Promise.resolve();
    const currentLock = prevLock.then(() =>
      processMessage(senderId, messageText)
    );
    userLocks.set(senderId, currentLock.catch(() => {}));
  }
}

async function processMessage(
  senderId: string,
  messageText: string
): Promise<void> {
  try {
    logger.info({ senderId, messageText }, "Processing message");

    // Show typing indicator
    await facebookService.sendTypingOn(senderId);

    // Get AI response
    const response = await aiService.processMessage(senderId, messageText);

    // Send response
    await facebookService.sendTextMessage(senderId, response);
    await facebookService.sendTypingOff(senderId);

    logger.info({ senderId, responseLength: response.length }, "Message sent");
  } catch (error) {
    logger.error({ error, senderId }, "Failed to process message");

    try {
      await facebookService.sendTextMessage(
        senderId,
        "Dạ em xin lỗi, hiện tại hệ thống đang gặp sự cố. Chị/anh thử lại sau giúp em nha!"
      );
    } catch {
      // Ignore send failure for error message
    }
  }
}
