import { Router } from "express";
import { verifyWebhook, handleWebhook } from "../controllers/webhook.controller.js";

const router = Router();

// Facebook webhook verification
router.get("/webhook", verifyWebhook);

// Handle incoming webhook events
router.post("/webhook", handleWebhook);

export default router;
