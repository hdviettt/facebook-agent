import { supabaseService } from "../services/supabase.service.js";
import { logger } from "../config/logger.js";

interface SearchProductsInput {
  query: string;
  category?: string;
  max_results?: number;
}

export async function searchProducts(input: SearchProductsInput) {
  const limit = Math.min(input.max_results ?? 5, 10);

  logger.info({ query: input.query, category: input.category }, "Searching products");

  const products = await supabaseService.searchProducts(input.query, limit);

  // Filter by category if specified
  const filtered = input.category
    ? products.filter(
        (p) =>
          p.category?.toLowerCase().includes(input.category!.toLowerCase())
      )
    : products;

  return filtered.map((p) => ({
    id: p.id,
    nhanh_id: p.nhanh_id,
    name: p.name,
    code: p.code,
    category: p.category,
    price: p.price,
    image_url: p.image_url,
    status: p.status,
    inventory: p.inventory,
  }));
}
