import { nhanhService } from "../services/nhanh.service.js";
import { supabaseService } from "../services/supabase.service.js";
import { generateAppOrderId } from "../utils/order-id.js";
import { logger } from "../config/logger.js";
import type { NhanhOrderRequest } from "../types/nhanh.types.js";

interface CreateOrderInput {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_email?: string;
  products: Array<{
    product_id: number;
    quantity: number;
    price: number;
  }>;
  note?: string;
  senderId?: string;
}

export async function createOrder(input: CreateOrderInput) {
  logger.info(
    { customerName: input.customer_name, productCount: input.products.length },
    "Creating order"
  );

  // Look up nhanh_id for each product and validate stock
  const nhanhProducts: Array<{ id: number; price: number; quantity: number }> = [];

  for (const item of input.products) {
    const product = await supabaseService.getProductById(item.product_id);
    if (!product) {
      return { success: false, error: `Product ID ${item.product_id} not found` };
    }
    if (!product.nhanh_id) {
      return { success: false, error: `Product "${product.name}" is not synced to Nhanh.vn` };
    }
    if (product.quantity < item.quantity) {
      return {
        success: false,
        error: `${product.name}: only ${product.quantity} in stock, requested ${item.quantity}`,
      };
    }
    nhanhProducts.push({
      id: product.nhanh_id,
      price: item.price,
      quantity: item.quantity,
    });
  }

  const appOrderId = generateAppOrderId();

  const orderData: NhanhOrderRequest = {
    info: {
      type: 1,
      description: input.note,
    },
    channel: {
      appOrderId,
      sourceName: "Facebook Messenger",
    },
    shippingAddress: {
      name: input.customer_name,
      mobile: input.customer_phone,
      email: input.customer_email,
      address: input.customer_address,
    },
    carrier: {},
    products: nhanhProducts,
  };

  // Push to Nhanh.vn
  const result = await nhanhService.createOrder(orderData);

  // Save to Supabase
  await supabaseService.saveOrder({
    sender_id: input.senderId ?? "unknown",
    app_order_id: appOrderId,
    status: result.success ? "created" : "failed",
    order_data: orderData as unknown as Record<string, unknown>,
  });

  // Deduct stock on success
  if (result.success) {
    for (const item of input.products) {
      await supabaseService.deductStock(item.product_id, item.quantity);
    }

    return {
      success: true,
      order_id: result.orderId,
      app_order_id: appOrderId,
      tracking_url: result.trackingUrl,
      message: "Order created successfully",
    };
  }

  return {
    success: false,
    error: result.error,
    message: "Failed to create order",
  };
}
