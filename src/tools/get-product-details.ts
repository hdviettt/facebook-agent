import { supabaseService } from "../services/supabase.service.js";
import { nhanhService } from "../services/nhanh.service.js";
import { logger } from "../config/logger.js";

interface GetProductDetailsInput {
  product_id: number;
}

export async function getProductDetails(input: GetProductDetailsInput) {
  logger.info({ productId: input.product_id }, "Getting product details");

  // Try local DB first
  let product = await supabaseService.getProductById(input.product_id);

  // Try by Nhanh ID if not found
  if (!product) {
    product = await supabaseService.getProductByNhanhId(input.product_id);
  }

  // Fallback to Nhanh.vn API
  if (!product) {
    const nhanhProduct = await nhanhService.getProduct(input.product_id);
    if (nhanhProduct) {
      return {
        id: nhanhProduct.id,
        name: nhanhProduct.name,
        code: nhanhProduct.code,
        description: nhanhProduct.description,
        price: nhanhProduct.price,
        wholesale_price: nhanhProduct.wholesalePrice,
        image_url: nhanhProduct.avatar,
        inventory: nhanhProduct.inventory,
        weight: nhanhProduct.weight,
        source: "nhanh.vn",
      };
    }

    return { error: "Product not found" };
  }

  return {
    id: product.id,
    nhanh_id: product.nhanh_id,
    name: product.name,
    code: product.code,
    description: product.description,
    category: product.category,
    brand: product.brand,
    price: product.price,
    wholesale_price: product.wholesale_price,
    image_url: product.image_url,
    attributes: product.attributes,
    inventory: product.inventory,
    weight: product.weight,
    source: "database",
  };
}
