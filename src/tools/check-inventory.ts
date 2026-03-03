import { supabaseService } from "../services/supabase.service.js";
import { nhanhService } from "../services/nhanh.service.js";
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

  if (!product.nhanh_id) {
    return {
      error: `Product "${product.name}" is not synced to inventory system`,
    };
  }

  try {
    const nhanhProduct = await nhanhService.getProduct(product.nhanh_id);

    if (!nhanhProduct) {
      return {
        product_id: product.id,
        product_name: product.name,
        error: "Could not retrieve inventory data from Nhanh.vn",
      };
    }

    const available = nhanhProduct.inventory?.available ?? 0;

    return {
      product_id: product.id,
      product_name: product.name,
      available,
      in_stock: available > 0,
    };
  } catch (error: any) {
    logger.error(
      { productId: input.product_id, error: error.message },
      "Failed to check inventory from Nhanh.vn"
    );
    return {
      product_id: product.id,
      product_name: product.name,
      error: "Inventory check temporarily unavailable, please try again later",
    };
  }
}
