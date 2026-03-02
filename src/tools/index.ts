import { searchProducts } from "./search-products.js";
import { getProductDetails } from "./get-product-details.js";
import { checkInventory } from "./check-inventory.js";
import { createOrder } from "./create-order.js";

type ToolHandler = (input: any) => Promise<unknown>;

const toolRegistry = new Map<string, ToolHandler>([
  ["search_products", searchProducts],
  ["get_product_details", getProductDetails],
  ["check_inventory", checkInventory],
  ["create_order", createOrder],
]);

export function getToolHandler(name: string): ToolHandler | undefined {
  return toolRegistry.get(name);
}
