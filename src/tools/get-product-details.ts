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

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price,
    image_url: product.image_url,
  };
}
