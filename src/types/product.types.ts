export interface Product {
  id: number;
  nhanh_id: number | null;
  name: string;
  description: string | null;
  category: string | null;
  price: number | null;
  quantity: number;
  image_url: string | null;
  status: string;
  created_at: string;
}
