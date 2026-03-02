// Nhanh.vn API v3.0 types

export interface NhanhApiResponse<T = unknown> {
  code: 0 | 1;
  data?: T;
  errorCode?: string;
  messages?: string | Record<string, string>;
  warnings?: string[];
}

export interface NhanhProductFilters {
  name?: string;
  ids?: number[];
  categoryIds?: number[];
  status?: string[];
}

export interface NhanhPaginator {
  size?: number;
  sort?: Record<string, string>;
  next?: Record<string, unknown>;
}

export interface NhanhProduct {
  id: number;
  code: string;
  barcode: string;
  name: string;
  otherName: string;
  description: string;
  categoryId: number;
  brandId: number;
  price: number;
  wholesalePrice: number;
  avatar: string;
  status: string;
  inventory: {
    remain: number;
    available: number;
    shipping: number;
    holding: number;
  };
  weight: number;
  width: number;
  height: number;
  length: number;
}

export interface NhanhOrderRequest {
  info: {
    depotId?: number;
    type?: number;
    description?: string;
    privateDescription?: string;
  };
  channel: {
    appOrderId: string;
    sourceName?: string;
  };
  shippingAddress: {
    name: string;
    mobile: string;
    email?: string;
    address?: string;
    cityId?: number;
    districtId?: number;
    wardId?: number;
  };
  carrier: {
    id?: number;
    customerShipFee?: number;
  };
  products: Array<{
    id: number;
    price: number;
    quantity: number;
    description?: string;
  }>;
  payment?: {
    depositAmount?: number;
    couponCode?: string;
    discountAmount?: number;
    discountType?: "cash" | "percent";
  };
}

export interface NhanhOrderResponse {
  id: number;
  trackingUrl: string;
}
