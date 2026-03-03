import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import type { Product } from "../types/product.types.js";

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

  async searchProducts(query: string, limit = 5): Promise<Product[]> {
    const pattern = `%${query}%`;
    const { data, error } = await this.client
      .from("products")
      .select("*")
      .eq("status", "active")
      .or(`name.ilike.${pattern},other_name.ilike.${pattern},description.ilike.${pattern}`)
      .limit(limit);

    if (error) {
      logger.error({ error }, "Product search failed");
      return [];
    }

    return data ?? [];
  }

  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await this.client
      .from("products")
      .select("*")
      .eq("status", "active");

    if (error) {
      logger.error({ error }, "Failed to get all products");
      return [];
    }

    return data ?? [];
  }

  async getProductById(id: number): Promise<Product | null> {
    const { data, error } = await this.client
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      logger.error({ error, id }, "Failed to get product");
      return null;
    }

    return data;
  }

  async updateNhanhId(productId: number, nhanhId: number): Promise<void> {
    const { error } = await this.client
      .from("products")
      .update({ nhanh_id: nhanhId })
      .eq("id", productId);

    if (error) {
      logger.error({ error, productId, nhanhId }, "Failed to update nhanh_id");
    }
  }

  async saveOrder(order: {
    sender_id: string;
    app_order_id: string;
    status?: string;
    order_data: Record<string, unknown>;
  }): Promise<void> {
    const { error } = await this.client.from("orders").insert(order);
    if (error) {
      logger.error({ error }, "Failed to save order");
    }
  }
}

export const supabaseService = new SupabaseService();
