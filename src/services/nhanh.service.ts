import axios from "axios";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { RateLimiter } from "../utils/rate-limiter.js";
import type {
  NhanhApiResponse,
  NhanhProduct,
  NhanhProductFilters,
  NhanhPaginator,
  NhanhOrderRequest,
  NhanhOrderResponse,
} from "../types/nhanh.types.js";

const BASE_URL = "https://pos.open.nhanh.vn";

class NhanhService {
  private rateLimiter: RateLimiter;

  private get appId() { return env.NHANH_APP_ID; }
  private get businessId() { return env.NHANH_BUSINESS_ID; }
  private get accessToken() { return env.NHANH_ACCESS_TOKEN; }

  constructor() {
    this.rateLimiter = new RateLimiter(150, 30_000);
  }

  /**
   * Search/list products from Nhanh.vn
   */
  async listProducts(
    filters?: NhanhProductFilters,
    paginator?: NhanhPaginator
  ): Promise<NhanhProduct[]> {
    const body: Record<string, unknown> = {};

    if (filters) {
      body.filters = filters;
    }
    if (paginator) {
      body.paginator = paginator;
    }

    const response = await this.request<NhanhApiResponse<NhanhProduct[]>>(
      "/v3.0/product/list",
      body
    );

    if (response.code === 1 && response.data) {
      return response.data;
    }

    logger.warn({ response }, "Nhanh product list returned no data");
    return [];
  }

  /**
   * Get a single product by Nhanh ID
   */
  async getProduct(productId: number): Promise<NhanhProduct | null> {
    const products = await this.listProducts({ ids: [productId] });
    return products[0] ?? null;
  }

  /**
   * Create an order on Nhanh.vn
   */
  async createOrder(
    orderData: NhanhOrderRequest
  ): Promise<{ success: boolean; orderId?: number; trackingUrl?: string; error?: string }> {
    try {
      const response = await this.request<NhanhApiResponse<NhanhOrderResponse>>(
        "/v3.0/order/add",
        orderData
      );

      if (response.code === 1 && response.data) {
        return {
          success: true,
          orderId: response.data.id,
          trackingUrl: response.data.trackingUrl,
        };
      }

      const errorMsg =
        typeof response.messages === "string"
          ? response.messages
          : JSON.stringify(response.messages);

      return { success: false, error: errorMsg };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Make an authenticated request to Nhanh.vn API
   */
  private async request<T>(endpoint: string, body?: unknown): Promise<T> {
    await this.rateLimiter.acquire();

    const url = `${BASE_URL}${endpoint}`;
    const params = {
      appId: this.appId,
      businessId: this.businessId,
    };

    logger.debug({ url, params }, "Nhanh API request");

    const response = await axios.post<T>(url, body ?? {}, {
      params,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.accessToken,
      },
    });

    return response.data;
  }
}

export const nhanhService = new NhanhService();
