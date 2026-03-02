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
    nhanh_product_id: number;
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
    products: input.products.map((p) => ({
      id: p.nhanh_product_id,
      price: p.price,
      quantity: p.quantity,
    })),
  };

  const result = await nhanhService.createOrder(orderData);

  // Save order to database
  await supabaseService.saveOrder({
    sender_id: input.senderId ?? "unknown",
    app_order_id: appOrderId,
    status: result.success ? "created" : "failed",
    order_data: orderData as unknown as Record<string, unknown>,
  });

  if (result.success) {
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
