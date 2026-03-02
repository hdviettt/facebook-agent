import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Facebook Messenger Platform
  FB_PAGE_ACCESS_TOKEN: z.string().default(""),
  FB_VERIFY_TOKEN: z.string().min(1, "FB_VERIFY_TOKEN is required"),
  FB_APP_SECRET: z.string().default(""),

  // Anthropic
  ANTHROPIC_API_KEY: z.string().default(""),

  // Supabase
  SUPABASE_URL: z.string().default("https://placeholder.supabase.co"),
  SUPABASE_SERVICE_KEY: z.string().default(""),

  // Nhanh.vn
  NHANH_APP_ID: z.string().default(""),
  NHANH_BUSINESS_ID: z.string().default(""),
  NHANH_ACCESS_TOKEN: z.string().default(""),

  // Optional
  CLAUDE_MODEL: z.string().default("claude-sonnet-4-20250514"),
  MAX_CONVERSATION_HISTORY: z.coerce.number().default(20),
  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"])
    .default("info"),
});

export const env = envSchema.parse(process.env);
