export interface Product {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  price: number | null;
  image_url: string | null;
  status: string;
  created_at: string;
}
