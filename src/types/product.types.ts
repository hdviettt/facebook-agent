export interface PricingTier {
  format: string;
  price: number;
  note?: string;
}

export interface ProductAttributes {
  ingredients?: string;
  packaging?: string;
  recipes?: string[];
  usage_instructions?: string;
  tips?: string;
  storage?: string;
  special_notes?: string;
  shelf_life?: string;
  pricing_tiers?: PricingTier[];
}

export interface Product {
  id: number;
  nhanh_id: number | null;
  code: string | null;
  barcode: string | null;
  name: string;
  other_name: string | null;
  description: string | null;
  category: string | null;
  brand: string | null;
  price: number | null;
  wholesale_price: number | null;
  image_url: string | null;
  status: string;
  attributes: ProductAttributes;
  inventory: Record<string, unknown>;
  weight: number | null;
  dimensions: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
