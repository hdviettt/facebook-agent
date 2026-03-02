import type OpenAI from "openai";

// Phase 1: Product knowledge tools
const phase1Tools: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Search for products by name, category, or keyword. Use this when the customer asks about available products, product recommendations, or searches for specific items.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Search query: product name, keyword, or category (e.g., 'ao thun trang', 'giay nike', 'son mac')",
          },
          category: {
            type: "string",
            description: "Optional category filter to narrow results",
          },
          max_results: {
            type: "number",
            description: "Maximum number of results to return. Default 5, max 10.",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_details",
      description:
        "Get detailed information about a specific product by its ID. Use this when the customer asks for more details about a particular product, wants to see attributes (color, size, material), or needs the full description.",
      parameters: {
        type: "object",
        properties: {
          product_id: {
            type: "number",
            description: "The product ID",
          },
        },
        required: ["product_id"],
      },
    },
  },
];

// Phase 2: Order tools (Nhanh.vn)
const phase2Tools: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "check_inventory",
      description:
        "Check real-time inventory/stock availability for a product. Use this when the customer asks if a product is in stock, available quantity, or before creating an order.",
      parameters: {
        type: "object",
        properties: {
          product_id: {
            type: "number",
            description: "The Nhanh.vn product ID to check inventory for",
          },
        },
        required: ["product_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_order",
      description:
        "Create a new order on the Nhanh.vn system. ONLY use this when the customer has explicitly confirmed they want to place an order AND you have collected all required information: customer name, phone number, delivery address, and the products with quantities. Always confirm the order details with the customer before calling this tool.",
      parameters: {
        type: "object",
        properties: {
          customer_name: {
            type: "string",
            description: "Full name of the customer for delivery",
          },
          customer_phone: {
            type: "string",
            description: "Customer phone number (e.g., 0912345678)",
          },
          customer_address: {
            type: "string",
            description: "Full delivery address",
          },
          customer_email: {
            type: "string",
            description: "Optional customer email",
          },
          products: {
            type: "array",
            description: "Array of products to order",
            items: {
              type: "object",
              properties: {
                nhanh_product_id: {
                  type: "number",
                  description: "Product ID on Nhanh.vn",
                },
                quantity: {
                  type: "number",
                  description: "Quantity to order",
                },
                price: {
                  type: "number",
                  description: "Unit price of the product",
                },
              },
              required: ["nhanh_product_id", "quantity", "price"],
            },
          },
          note: {
            type: "string",
            description: "Optional order note or special instructions",
          },
        },
        required: ["customer_name", "customer_phone", "customer_address", "products"],
      },
    },
  },
];

export function getToolDefinitions(enableOrders: boolean): OpenAI.ChatCompletionTool[] {
  return enableOrders ? [...phase1Tools, ...phase2Tools] : phase1Tools;
}
