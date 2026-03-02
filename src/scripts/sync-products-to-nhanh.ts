/**
 * Sync products from Supabase to Nhanh.vn
 *
 * Pushes all Supabase products to Nhanh.vn via product/add API,
 * then saves the returned Nhanh.vn IDs back to Supabase.
 *
 * Usage: npx tsx src/scripts/sync-products-to-nhanh.ts
 */
import "dotenv/config";
import axios from "axios";
import { supabaseService } from "../services/supabase.service.js";

const NHANH_BASE_URL = "https://pos.open.nhanh.vn";
const appId = process.env.NHANH_APP_ID;
const businessId = process.env.NHANH_BUSINESS_ID;
const accessToken = process.env.NHANH_ACCESS_TOKEN;

async function main() {
  if (!appId || !businessId || !accessToken) {
    console.error("Missing NHANH_APP_ID, NHANH_BUSINESS_ID, or NHANH_ACCESS_TOKEN in .env");
    process.exit(1);
  }

  console.log("Fetching products from Supabase...");
  const products = await supabaseService.getAllProducts();
  console.log(`Found ${products.length} products`);

  if (products.length === 0) {
    console.log("No products to sync.");
    return;
  }

  // Build Nhanh.vn payload
  const nhanhProducts = products.map((p) => ({
    appProductId: String(p.id),
    name: p.name,
    price: p.price ?? 0,
    description: p.description ?? "",
  }));

  console.log("Pushing products to Nhanh.vn...");
  const response = await axios.post(
    `${NHANH_BASE_URL}/v3.0/product/add?appId=${appId}&businessId=${businessId}`,
    nhanhProducts,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken,
      },
    }
  );

  const data = response.data;

  if (data.code !== 1) {
    console.error("Nhanh.vn error:", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log("Products pushed successfully. Saving Nhanh.vn IDs back to Supabase...");

  for (const item of data.data) {
    const supabaseId = Number(item.appProductId);
    const nhanhId = Number(item.id);
    console.log(`  Product ${supabaseId} → Nhanh ID ${nhanhId}`);
    await supabaseService.updateNhanhId(supabaseId, nhanhId);
  }

  console.log("Done! All products synced.");
}

main().catch((err) => {
  console.error("Sync failed:", err.response?.data ?? err.message);
  process.exit(1);
});
