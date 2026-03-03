/**
 * One-time migration: transfer nhanh_ids from old ASCII product rows
 * to new Vietnamese-diacritics rows, delete old rows, and update Nhanh.vn.
 *
 * Usage: npx tsx src/scripts/migrate-diacritics.ts
 */
import "dotenv/config";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const appId = process.env.NHANH_APP_ID;
const businessId = process.env.NHANH_BUSINESS_ID;
const accessToken = process.env.NHANH_ACCESS_TOKEN;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const NHANH_BASE_URL = "https://pos.open.nhanh.vn";

// Mapping: old ASCII name → new diacritics name (same product order)
const NAME_MAP: Record<string, string> = {
  "Nuoc Cot Lau Thai Chua Cay": "Nước Cốt Lẩu Thái Chua Cay",
  "Sot Pho Mai Ngot": "Sốt Phô Mai Ngọt",
  "Sot Pho Mai Bo Lo": "Sốt Phô Mai Bỏ Lò",
  "Sot Trung Muoi": "Sốt Trứng Muối",
  "Sot Bo Toi": "Sốt Bơ Tỏi",
  "Sot Me": "Sốt Me",
  "Sot Chanh Leo": "Sốt Chanh Leo",
  "Sot Muoi Ot Xanh": "Sốt Muối Ớt Xanh",
  "Sot Ot Do": "Sốt Ớt Đỏ",
  "Sot Cay": "Sốt Cay",
  "Mam Cham Oc": "Mắm Chấm Ốc",
  "Sot Dau Giam Tron Salad": "Sốt Dầu Giấm Trộn Salad",
  "Sot Chay Toi": "Sốt Cháy Tỏi",
  "Sot Chien Mam": "Sốt Chiên Mắm",
};

async function main() {
  console.log("=== Diacritics Migration ===\n");

  // Step 1: Fetch all products
  const { data: allProducts, error: fetchErr } = await supabase
    .from("products")
    .select("id, name, nhanh_id, price, description")
    .eq("status", "active")
    .order("id");

  if (fetchErr || !allProducts) {
    console.error("Failed to fetch products:", fetchErr);
    process.exit(1);
  }

  console.log(`Found ${allProducts.length} total products\n`);

  // Step 2: Separate old (ASCII with nhanh_id) and new (diacritics without)
  const oldProducts = allProducts.filter(
    (p) => p.nhanh_id != null && Object.keys(NAME_MAP).includes(p.name)
  );
  const newProducts = allProducts.filter(
    (p) => p.nhanh_id == null && Object.values(NAME_MAP).includes(p.name)
  );

  console.log(`Old ASCII products (with nhanh_id): ${oldProducts.length}`);
  console.log(`New diacritics products (without nhanh_id): ${newProducts.length}\n`);

  if (oldProducts.length === 0) {
    console.log("No old ASCII products found. Nothing to migrate.");
    return;
  }

  if (newProducts.length === 0) {
    console.log("No new diacritics products found. Run 'npm run seed' first.");
    return;
  }

  // Step 3: Build mapping old → new via NAME_MAP
  const migrations: Array<{
    oldId: number;
    oldName: string;
    newId: number;
    newName: string;
    nhanhId: number;
  }> = [];

  for (const old of oldProducts) {
    const expectedNewName = NAME_MAP[old.name];
    if (!expectedNewName) continue;

    const newProduct = newProducts.find((p) => p.name === expectedNewName);
    if (!newProduct) {
      console.warn(`  WARN: No new product found for "${old.name}" → "${expectedNewName}"`);
      continue;
    }

    migrations.push({
      oldId: old.id,
      oldName: old.name,
      newId: newProduct.id,
      newName: newProduct.name,
      nhanhId: old.nhanh_id,
    });
  }

  console.log(`Matched ${migrations.length} product pairs:\n`);
  for (const m of migrations) {
    console.log(`  [${m.oldId}] ${m.oldName} (nhanh:${m.nhanhId}) → [${m.newId}] ${m.newName}`);
  }

  // Step 4: Transfer nhanh_ids from old → new rows
  console.log("\nTransferring nhanh_ids...");
  for (const m of migrations) {
    // Clear nhanh_id from old row first (unique constraint)
    const { error: clearErr } = await supabase
      .from("products")
      .update({ nhanh_id: null })
      .eq("id", m.oldId);

    if (clearErr) {
      console.error(`  Failed to clear nhanh_id on old row ${m.oldId}:`, clearErr);
      continue;
    }

    // Set nhanh_id on new row
    const { error: setErr } = await supabase
      .from("products")
      .update({ nhanh_id: m.nhanhId })
      .eq("id", m.newId);

    if (setErr) {
      console.error(`  Failed to set nhanh_id on new row ${m.newId}:`, setErr);
      continue;
    }

    console.log(`  nhanh_id ${m.nhanhId}: [${m.oldId}] → [${m.newId}]`);
  }

  // Step 5: Delete old ASCII rows
  console.log("\nDeleting old ASCII product rows...");
  const oldIds = migrations.map((m) => m.oldId);
  const { error: deleteErr } = await supabase
    .from("products")
    .delete()
    .in("id", oldIds);

  if (deleteErr) {
    console.error("Failed to delete old rows:", deleteErr);
  } else {
    console.log(`  Deleted ${oldIds.length} old rows`);
  }

  // Step 6: Update Nhanh.vn product names
  if (!appId || !businessId || !accessToken) {
    console.warn("\nSkipping Nhanh.vn update (missing NHANH env vars)");
  } else {
    console.log("\nUpdating products on Nhanh.vn...");

    // Fetch fresh new products with nhanh_ids
    const { data: updatedProducts } = await supabase
      .from("products")
      .select("id, name, nhanh_id, price, description")
      .eq("status", "active")
      .not("nhanh_id", "is", null)
      .order("id");

    if (updatedProducts && updatedProducts.length > 0) {
      const nhanhPayload = updatedProducts.map((p) => ({
        appProductId: String(p.id),
        id: p.nhanh_id,
        name: p.name,
        price: p.price ?? 0,
        description: p.description ?? "",
      }));

      try {
        const response = await axios.post(
          `${NHANH_BASE_URL}/v3.0/product/add?appId=${appId}&businessId=${businessId}`,
          nhanhPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: accessToken,
            },
          }
        );

        const data = response.data;
        if (data.code === 1) {
          console.log("  Nhanh.vn products updated successfully!");

          // Update nhanh_ids if the API returned new ones
          if (data.data && Array.isArray(data.data)) {
            for (const item of data.data) {
              const supabaseId = Number(item.appProductId);
              const nhanhId = Number(item.id);
              await supabase
                .from("products")
                .update({ nhanh_id: nhanhId })
                .eq("id", supabaseId);
              console.log(`  Product ${supabaseId} → Nhanh ID ${nhanhId}`);
            }
          }
        } else {
          console.warn("  Nhanh.vn response:", JSON.stringify(data, null, 2));
        }
      } catch (err: any) {
        console.error("  Nhanh.vn update failed:", err.response?.data ?? err.message);
      }
    }
  }

  // Step 7: Verify final state
  console.log("\n=== Final State ===");
  const { data: finalProducts } = await supabase
    .from("products")
    .select("id, name, nhanh_id")
    .eq("status", "active")
    .order("id");

  if (finalProducts) {
    for (const p of finalProducts) {
      const nhanhStatus = p.nhanh_id ? `nhanh:${p.nhanh_id}` : "NOT SYNCED";
      console.log(`  [${p.id}] ${p.name} (${nhanhStatus})`);
    }
  }

  console.log("\nMigration complete!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
