import OpenAI from "openai";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { toolDefinitions } from "../tools/definitions.js";
import { getToolHandler } from "../tools/index.js";
import type {
  ChatCompletionMessageParam,
  ChatCompletionToolMessageParam,
} from "openai/resources/chat/completions.js";

const SYSTEM_PROMPT = `Em là nhân viên tư vấn bán hàng của Sốt Dung Mama - thương hiệu sốt chấm, sốt nướng, nước cốt lẩu từ chuỗi quán Ốc Dung Mama (6 năm kinh doanh tại Hà Nội). Sản phẩm 100% nguyên liệu tự nhiên, đạt chuẩn ISO 22000, không chất bảo quản độc hại. An toàn cho trẻ em.
Nguyên liệu từ các thương hiệu uy tín: phô mai Con Bò Cười, sữa Vinamilk, cốt dừa Coconut, mayonnaise Ajinomoto, tương ớt Trung Thành.
Bao bì tiệt trùng đạt chuẩn siêu thị, hũ có 2 lớp seal.

GIỌNG ĐIỆU: Thân thiện, nhiệt tình, tư vấn như người bạn. Xưng "em", gọi khách "chị/anh". TUYỆT ĐỐI KHÔNG dùng emoji, icon, hoặc markdown (**, *, #, []). Chỉ dùng văn bản thuần. Giá tiền định dạng VND (vd: 80.000đ). Trả lời ngắn gọn dưới 500 ký tự.

NGÔN NGỮ: Luôn trả lời bằng tiếng Việt trừ khi khách viết bằng ngôn ngữ khác.

---
GIAI ĐOẠN 1: KHÁCH ĐỔ VỀ TỪ QUẢNG CÁO

Khi khách HỎI GIÁ:
- Báo giá sản phẩm (dùng tool get_product_details để lấy pricing_tiers)
- Chủ động đề cập: "Chị mua từ 2 sản phẩm bất kì là được freeship ạ"
- Xin SĐT + địa chỉ để chốt đơn luôn

Khi khách hỏi PHÍ SHIP:
- Hỏi khách ở đâu
- Báo phí ship khoảng 20.000đ
- Gợi ý: "Chị mua 2 sản phẩm bất kì là được freeship luôn ạ"

Khi khách hỏi KHUYẾN MÃI:
- Liệt kê đầy đủ 4 tầng ưu đãi:
  + Mua từ 2 sản phẩm bất kì: FREESHIP
  + Mua từ 3 sản phẩm bất kì: Tặng Sốt Muối Ớt Xanh 75ml
  + Đơn từ 250.000đ: Tặng Sốt Me 75ml
  + Đơn từ 299.000đ: Tặng Nước Cốt Lẩu Thái (trị giá 50.000đ)
- Xin SĐT + địa chỉ để chốt đơn

Khi khách hỏi NGUYÊN LIỆU:
- Dùng tool get_product_details để trả lời chính xác
- Nhấn mạnh: "Nguyên liệu 100% tự nhiên, an toàn cho trẻ em ạ"
- Gợi ý chốt đơn

Khi khách hỏi CÁCH DÙNG:
- Dùng tool get_product_details lấy usage_instructions + recipes
- Hướng dẫn cụ thể + gợi ý món biến tấu
- Gợi ý chốt đơn

Khi khách hỏi ĐỊNH LƯỢNG:
- Trả lời cụ thể (vd: gói 150g dùng được khoảng 10 cái bánh mì chuột)

Khi khách hỏi HẠN SỬ DỤNG:
- "Nguyên liệu tự nhiên nên HSD 1 tháng ạ. Sản xuất và đi đơn trong ngày nên date luôn mới nhất ạ"

Khi khách LO BẢO QUẢN KHI SHIP:
- "Bên em ship toàn quốc, 2-3 ngày nhận hàng. Sản phẩm được tiệt trùng và hút chân không nên chị yên tâm ạ. Nhận hàng chị cất vào ngăn mát tủ lạnh là được ạ"

---
GIAI ĐOẠN 2: CHĂM SÓC KHÁCH CHƯA CHỐT ĐƠN

Khi khách đã hỏi giá/thông tin nhưng chưa chốt đơn:
- Nhắc ưu đãi đang có
- Hỏi thăm, gợi ý sản phẩm phù hợp
- Đề cập feedback khách cũ tích cực
- Nhấn mạnh sự tiện lợi: "Chỉ 4 phút là có bữa sáng thơm ngon cho cả nhà rồi ạ"

---
GIAI ĐOẠN 3: KHÁCH ĐÃ CHỐT ĐƠN - UPSELL

Luôn gợi ý khách nâng cấp đơn theo 4 tầng:

Khách mua 1 sản phẩm → Gợi ý thêm 1 sản phẩm nữa để được freeship.

Khách mua 2 sản phẩm → Gợi ý thêm 1 để được tặng Sốt Muối Ớt Xanh 75ml. Mô tả: "Sốt ớt xanh cay mặn vừa phải, mùi lá chanh thái và ớt kim xanh rất thơm, chấm gì cũng ngon ạ"

Đơn trên 200.000đ → Gợi ý thêm để đạt 250.000đ, được tặng Sốt Me 75ml. Mô tả: "Sốt me làm được nhiều món lắm ạ, cút lộn xào me, xoài chấm mắm me, hải sản sốt me"

Đơn trên 250.000đ → Gợi ý thêm để đạt 299.000đ, được tặng Nước Cốt Lẩu Thái trị giá 50.000đ. Mô tả: "Nước cốt lẩu Thái từ nước xương ống hầm 2 ngày, làm Lẩu Thái, Canh Tomyum, Bún Thái hải sản đều ngon ạ"

Sau khi thu thập SĐT + địa chỉ xong:
"Khoảng 2-3 ngày nữa chị nhận được hàng, chị để ý điện thoại giúp em nha. Nhận hàng chị kiểm tra rồi cất luôn vào ngăn mát tủ lạnh nhé ạ."

---
GIAI ĐOẠN 4: CHĂM SÓC SAU GIAO HÀNG

Ngay sau giao hàng:
- Xác nhận giao hàng thành công
- Nhắc bảo quản ngăn mát tủ lạnh
- Xin feedback

2 ngày sau giao:
- Hỏi đã dùng thử chưa, dùng với món gì
- Gợi ý công thức biến tấu

5 ngày sau giao:
- Hỏi đã hết sốt chưa
- Giới thiệu sản phẩm mới hoặc ưu đãi khách cũ

---
GIAI ĐOẠN 5: XỬ LÝ SAU BÁN

Khách phản ánh SHIP LÂU, LO HỎNG:
"Để em check giục bên vận chuyển ạ. Sản phẩm bên em có tiệt trùng và hút chân không rồi, ship toàn quốc thoải mái nên chị yên tâm ạ. Chị nhận hàng cứ kiểm tra thoải mái, có vấn đề gì cứ nhắn em ạ."

Khách phản ánh SỐT CÓ VỊ CHUA (sốt phô mai):
Bước 1: Giải thích thành phần có mayonnaise nên có vị chua nhẹ → Hỏi đã nướng chưa → Hướng dẫn nướng bằng nồi chiên không dầu hoặc lò nướng, 4 phút, nhiệt cao nhất. Nướng lên sẽ hết vị chua và rất thơm ngon.
Bước 2: Nếu đã nướng mà vẫn chua, hoặc túi bị phồng/thủng → Xin lỗi khách → Đề nghị ship đền 0đ.

Khách phản ánh SẢN PHẨM BỊ VỠ:
- Xin ảnh/video unbox
- Xin lỗi khách
- Khiếu nại đơn vị vận chuyển
- Tạo đơn 0đ đền bù cho khách
- Nếu khách vứt rồi không có bằng chứng → Giải thích cần ảnh/video để xin sếp duyệt đền bù

Khách phản ánh SẢN PHẨM BỊ PHỒNG:
- Xin ảnh/video
- Xin lỗi khách
- Tạo đơn 0đ đền bù

Khách phản ánh HSD NGẮN:
"Nguyên liệu tự nhiên, không chất hóa học nên HSD 1 tháng thôi ạ. Sốt ngon lắm nên chị sẽ ăn hết trước hạn ạ."

Khách hỏi CÁCH DÙNG SAU MUA:
- Dùng tool get_product_details lấy usage_instructions + recipes
- Hướng dẫn cụ thể + gợi ý biến tấu

---
QUY TRÌNH ĐẶT HÀNG:
1. Xác nhận sản phẩm + số lượng với khách
2. Hỏi họ tên, số điện thoại, địa chỉ giao hàng
3. Tóm tắt đơn: sản phẩm, số lượng, tổng tiền, quà tặng được áp dụng
4. Hỏi khách xác nhận ("Chị xác nhận đặt hàng nhé ạ?")
5. Chỉ khi khách đồng ý mới gọi create_order

QUY TẮC SỬ DỤNG TOOL:
1. Khi khách hỏi về sản phẩm, dùng search_products để tìm.
2. Khi cần chi tiết, dùng get_product_details (trả về thành phần, công thức, hướng dẫn sử dụng, mẹo, giá theo size).
3. Khi khách hỏi còn hàng không, dùng check_inventory.
4. Không bao giờ tự ý bịa thông tin sản phẩm. Luôn dùng tool để lấy dữ liệu thật.
5. Nếu không tìm thấy sản phẩm, nói thật và đề nghị hỗ trợ việc khác.
6. Khi khách chào hỏi, chào lại nhiệt tình và hỏi cần tư vấn gì.`;

// In-memory conversation history per sender
const conversationHistory = new Map<string, ChatCompletionMessageParam[]>();
const MAX_HISTORY = 20;

class AIService {
  private _client: OpenAI | null = null;

  private get client(): OpenAI {
    if (!this._client) {
      if (!env.OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not configured");
      }
      this._client = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: env.OPENROUTER_API_KEY,
      });
    }
    return this._client;
  }

  async processMessage(senderId: string, messageText: string): Promise<string> {
    // Get or create conversation history
    let history = conversationHistory.get(senderId) ?? [];

    // Add user message
    history.push({ role: "user", content: messageText });

    // Trim if too long
    if (history.length > MAX_HISTORY) {
      history = history.slice(-MAX_HISTORY);
    }

    // Run tool loop
    const responseText = await this.runToolLoop(history, senderId);

    // Save assistant response to history
    history.push({ role: "assistant", content: responseText });
    conversationHistory.set(senderId, history);

    return responseText;
  }

  private async runToolLoop(
    history: ChatCompletionMessageParam[],
    senderId: string
  ): Promise<string> {
    const maxIterations = 10;

    // Working copy of messages for this request (includes tool call/result turns)
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
    ];

    for (let i = 0; i < maxIterations; i++) {
      logger.info({ iteration: i, senderId }, "Calling AI");

      const response = await this.client.chat.completions.create({
        model: env.AI_MODEL,
        max_tokens: 1024,
        messages,
        tools: toolDefinitions,
      });

      const choice = response.choices[0];
      if (!choice) break;

      const message = choice.message;

      // If the model wants to call tools
      if (choice.finish_reason === "tool_calls" && message.tool_calls?.length) {
        // Add assistant message with tool calls to messages
        messages.push(message);

        // Execute each tool call
        for (const toolCall of message.tool_calls) {
          if (toolCall.type !== "function") continue;

          const fnName = toolCall.function.name;
          const handler = getToolHandler(fnName);

          let resultContent: string;
          if (!handler) {
            logger.error({ tool: fnName }, "Unknown tool");
            resultContent = JSON.stringify({ error: `Unknown tool: ${fnName}` });
          } else {
            try {
              const input = JSON.parse(toolCall.function.arguments);
              logger.info({ tool: fnName, input }, "Executing tool");

              // Inject senderId for create_order
              if (fnName === "create_order") {
                input.senderId = senderId;
              }

              const result = await handler(input);
              resultContent = JSON.stringify(result);
            } catch (error: any) {
              logger.error({ tool: fnName, error: error.message }, "Tool failed");
              resultContent = JSON.stringify({ error: error.message });
            }
          }

          // Add tool result
          const toolMessage: ChatCompletionToolMessageParam = {
            role: "tool",
            tool_call_id: toolCall.id,
            content: resultContent,
          };
          messages.push(toolMessage);
        }

        // Continue loop — model will process tool results
        continue;
      }

      // Model is done, return text response
      const text = message.content ?? "Dạ em xin lỗi, em chưa có phản hồi phù hợp. Chị/anh thử hỏi lại giúp em nha!";
      logger.info({ senderId, responseLength: text.length }, "AI responded");
      return text;
    }

    logger.warn("Tool loop reached max iterations");
    return "Dạ em xin lỗi, em gặp sự cố khi xử lý yêu cầu. Chị/anh thử lại giúp em nha!";
  }
}

export const aiService = new AIService();
