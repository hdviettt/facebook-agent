import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import type { Product } from "../types/product.types.js";
import type {
  ConversationMessage,
  ToolCallRecord,
} from "../types/conversation.types.js";

class SupabaseService {
  private _client: SupabaseClient | null = null;

  private get client(): SupabaseClient {
    if (!this._client) {
      if (!env.SUPABASE_SERVICE_KEY) {
        throw new Error("SUPABASE_SERVICE_KEY is not configured");
      }
      this._client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
    }
    return this._client;
  }

  // --- Products ---

  async searchProducts(query: string, limit = 5): Promise<Product[]> {
    // Try full-text search first
    const { data, error } = await this.client
      .from("products")
      .select("*")
      .eq("status", "active")
      .textSearch("name", query, { type: "websearch", config: "simple" })
      .limit(limit);

    if (error) {
      logger.error({ error }, "Full-text search failed, falling back to ILIKE");
    }

    if (data && data.length > 0) return data;

    // Fallback to ILIKE
    const { data: ilikeData, error: ilikeError } = await this.client
      .from("products")
      .select("*")
      .eq("status", "active")
      .ilike("name", `%${query}%`)
      .limit(limit);

    if (ilikeError) {
      logger.error({ error: ilikeError }, "Product ILIKE search failed");
      return [];
    }

    return ilikeData ?? [];
  }

  async getProductById(id: number): Promise<Product | null> {
    const { data, error } = await this.client
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      logger.error({ error, id }, "Failed to get product by ID");
      return null;
    }

    return data;
  }

  async getProductByNhanhId(nhanhId: number): Promise<Product | null> {
    const { data, error } = await this.client
      .from("products")
      .select("*")
      .eq("nhanh_id", nhanhId)
      .single();

    if (error) {
      logger.error({ error, nhanhId }, "Failed to get product by Nhanh ID");
      return null;
    }

    return data;
  }

  async upsertProduct(product: Partial<Product>): Promise<Product | null> {
    const { data, error } = await this.client
      .from("products")
      .upsert(product, { onConflict: "nhanh_id" })
      .select()
      .single();

    if (error) {
      logger.error({ error }, "Failed to upsert product");
      return null;
    }

    return data;
  }

  async bulkUpsertProducts(products: Partial<Product>[]): Promise<void> {
    const { error } = await this.client
      .from("products")
      .upsert(products, { onConflict: "nhanh_id" });

    if (error) {
      logger.error({ error }, "Failed to bulk upsert products");
    }
  }

  // --- Conversations ---

  async getConversationHistory(
    senderId: string,
    limit?: number
  ): Promise<ConversationMessage[]> {
    const maxHistory = limit ?? env.MAX_CONVERSATION_HISTORY;

    const { data, error } = await this.client
      .from("conversations")
      .select("*")
      .eq("sender_id", senderId)
      .order("created_at", { ascending: false })
      .limit(maxHistory);

    if (error) {
      logger.error({ error, senderId }, "Failed to get conversation history");
      return [];
    }

    // Reverse to get chronological order
    return (data ?? []).reverse();
  }

  async saveMessage(
    senderId: string,
    role: "user" | "assistant",
    content: string,
    toolCalls?: ToolCallRecord[]
  ): Promise<void> {
    const { error } = await this.client.from("conversations").insert({
      sender_id: senderId,
      role,
      content,
      tool_calls: toolCalls ?? null,
    });

    if (error) {
      logger.error({ error, senderId, role }, "Failed to save message");
    }
  }

  async clearConversation(senderId: string): Promise<void> {
    const { error } = await this.client
      .from("conversations")
      .delete()
      .eq("sender_id", senderId);

    if (error) {
      logger.error({ error, senderId }, "Failed to clear conversation");
    }
  }

  // --- Orders ---

  async saveOrder(order: {
    sender_id: string;
    nhanh_order_id?: number;
    app_order_id: string;
    tracking_url?: string;
    status?: string;
    order_data: Record<string, unknown>;
    response_data?: Record<string, unknown>;
  }): Promise<void> {
    const { error } = await this.client.from("orders").insert(order);

    if (error) {
      logger.error({ error }, "Failed to save order");
    }
  }

  async getOrdersByUser(senderId: string) {
    const { data, error } = await this.client
      .from("orders")
      .select("*")
      .eq("sender_id", senderId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      logger.error({ error, senderId }, "Failed to get orders");
      return [];
    }

    return data ?? [];
  }
}

export const supabaseService = new SupabaseService();
