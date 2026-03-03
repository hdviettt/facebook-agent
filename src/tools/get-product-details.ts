import { supabaseService } from "../services/supabase.service.js";
import { logger } from "../config/logger.js";

interface GetProductDetailsInput {
  product_id: number;
}

export async function getProductDetails(input: GetProductDetailsInput) {
  logger.info({ productId: input.product_id }, "Getting product details");

  const product = await supabaseService.getProductById(input.product_id);

  if (!product) {
    return { error: "Product not found" };
  }

  const attrs = product.attributes ?? {};

  return {
    id: product.id,
    name: product.name,
    other_name: product.other_name,
    description: product.description,
    category: product.category,
    brand: product.brand,
    price: product.price,
    image_url: product.image_url,
    ingredients: attrs.ingredients,
    packaging: attrs.packaging,
    recipes: attrs.recipes,
    usage_instructions: attrs.usage_instructions,
    tips: attrs.tips,
    storage: attrs.storage,
    shelf_life: attrs.shelf_life,
    special_notes: attrs.special_notes,
    pricing_tiers: attrs.pricing_tiers,
  };
}
