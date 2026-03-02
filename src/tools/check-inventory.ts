import { nhanhService } from "../services/nhanh.service.js";
import { logger } from "../config/logger.js";

interface CheckInventoryInput {
  product_id: number;
}

export async function checkInventory(input: CheckInventoryInput) {
  logger.info({ productId: input.product_id }, "Checking inventory");

  const product = await nhanhService.getProduct(input.product_id);

  if (!product) {
    return { error: "Product not found on Nhanh.vn" };
  }

  const inventory = product.inventory ?? {
    remain: 0,
    available: 0,
    shipping: 0,
    holding: 0,
  };

  return {
    product_id: product.id,
    product_name: product.name,
    remain: inventory.remain,
    available: inventory.available,
    shipping: inventory.shipping,
    in_stock: inventory.available > 0,
  };
}
