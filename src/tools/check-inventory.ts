import { supabaseService } from "../services/supabase.service.js";
import { logger } from "../config/logger.js";

interface CheckInventoryInput {
  product_id: number;
}

export async function checkInventory(input: CheckInventoryInput) {
  logger.info({ productId: input.product_id }, "Checking inventory");

  const product = await supabaseService.getProductById(input.product_id);

  if (!product) {
    return { error: "Product not found" };
  }

  return {
    product_id: product.id,
    product_name: product.name,
    quantity: product.quantity,
    in_stock: product.quantity > 0,
  };
}
