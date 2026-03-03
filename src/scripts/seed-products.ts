/**
 * Seed all 14 Sốt Dung Mama products into Supabase
 *
 * Usage: npm run seed
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BRAND = "Sốt Dung Mama";
const COMMON_STORAGE =
  "Nhận hàng bảo quản ngay trong ngăn mát tủ lạnh. HSD: 30 ngày kể từ NSX. Không sử dụng sản phẩm khi hết hạn hoặc có dấu hiệu bị rách hoặc bị phồng.";
const SHELF_LIFE = "30 ngày kể từ ngày sản xuất";

const products = [
  {
    name: "Nước Cốt Lẩu Thái Chua Cay",
    other_name: "Nước cốt lẩu Thái",
    description:
      "Sản phẩm mới - Nước cốt lẩu Thái (không chỉ là gia vị lẩu Thái) làm từ nước hầm xương ống liên tục trong 2 ngày cô đọng, mang lại vị ngọt tự nhiên. Kết hợp với các gia vị Thái tạo nên hương vị thơm ngon.",
    category: "Nước cốt lẩu",
    price: 50000,
    attributes: {
      ingredients:
        "Nước hầm xương ống, Lá chanh Thái, gia vị Tomyum, Ớt kim, Dừa, Nước cốt dừa, Đường phèn, Hạt nêm",
      packaging: "Gói 150g",
      recipes: [
        "Lẩu Thái",
        "Canh Tomyum",
        "Mì tôm cay chua cay",
        "Ngao/mực/hải sản hấp Thái",
      ],
      usage_instructions:
        "Pha gói cốt lẩu vào 1 - 1,5 lít nước, đun sôi. Nhúng thêm các topping lẩu như thịt bò, gà, hải sản, nấm, các loại rau củ.",
      tips: "Khi sử dụng có thể thêm chút lá chanh, sả, ớt để trang trí nước dùng cho đẹp mắt và gia tăng hương vị cho món lẩu.",
      storage: COMMON_STORAGE,
      shelf_life: SHELF_LIFE,
      pricing_tiers: [
        { format: "Gói 150g", price: 50000 },
        {
          format: "Combo 3 gói 150g + tặng sốt ớt xanh 75ml",
          price: 120000,
        },
        {
          format: "Combo 5 gói 150g + tặng cốt lẩu Thái",
          price: 200000,
        },
      ],
    },
  },
  {
    name: "Sốt Phô Mai Ngọt",
    other_name: "Sốt Phô Mai Nướng Bánh Mì",
    description:
      "Sản phẩm best seller. Dùng làm bánh mì nướng phô mai để ăn sáng, ăn chiều. Các bạn nhỏ rất yêu thích. Chất sốt sánh mịn, màu vàng nhạt, vị béo ngậy.",
    category: "Sốt chấm",
    price: 80000,
    attributes: {
      ingredients:
        "Trứng gà tuyển chọn (chỉ lấy lòng đỏ), Mayonnaise, Phô mai Con Bò Cười, Sữa đặc",
      packaging: "Gói 150g",
      recipes: [
        "Bánh mì nướng phô mai",
        "Khoai lang nướng phô mai",
        "Ngô nướng phô mai",
        "Sandwich xúc xích nướng phô mai",
        "Khoai tây chiên chấm sốt phô mai",
        "Gà chiên giòn chấm sốt phô mai",
      ],
      usage_instructions:
        "Nướng bánh mì: Phết một lượng sốt phô mai vừa đủ lên ruột bánh mì. Nướng bằng lò nướng hoặc nồi chiên không dầu trong 3-5 phút ở mức nhiệt cao nhất. Làm sốt chấm: Dùng trực tiếp như sốt mayonnaise, có thể hâm nóng bằng hấp cách thuỷ hoặc lò vi sóng 15-20s.",
      tips: "Ngon hơn khi sử dụng cùng bánh mì đặc ruột. Có thể thêm chút phô mai Mozzarella hoặc Cheddar để tạo hiệu ứng bánh mì kéo sợi. Túi 150g được khoảng 10 cái bánh mì chuột.",
      storage: COMMON_STORAGE,
      shelf_life: SHELF_LIFE,
      pricing_tiers: [
        { format: "Gói 150g", price: 80000 },
        {
          format: "Combo 3 gói 150g + tặng sốt ớt xanh 75ml",
          price: 210000,
        },
        {
          format: "Combo 5 gói 150g + tặng cốt lẩu Thái",
          price: 350000,
        },
        { format: "Hũ 250g", price: 105000 },
        { format: "Hũ 500g", price: 195000 },
      ],
    },
  },
  {
    name: "Sốt Phô Mai Bỏ Lò",
    other_name: "Sốt Phô Mai Mặn",
    description:
      "Sản phẩm best seller. Sốt phô mai mặn dùng cho các món nướng bỏ lò, mì Ý, tokbokki phô mai.",
    category: "Sốt chấm",
    price: 80000,
    attributes: {
      ingredients: "Kem tươi, Sữa tươi, Bơ thơm, Bột mì, Đường trắng, Muối tinh, Cheese",
      packaging: "Gói 150g",
      recipes: [
        "Hải sản nướng phô mai bỏ lò",
        "Mì Ý / nui sốt phô mai & tôm/hải sản",
        "Tokbokki phô mai bỏ lò",
        "Khoai nướng phô mai bỏ lò",
        "Thịt nướng chấm sốt phô mai",
      ],
      usage_instructions:
        "Làm sốt chấm: Dùng trực tiếp hoặc hâm nóng bằng hấp cách thuỷ / lò vi sóng 15-20s. Làm sốt nướng: Đảo nóng sốt trên chảo, cho nguyên liệu đã chần sơ qua vào đảo đều. Đổ hỗn hợp ra giấy bạc rồi nướng bằng lò nướng hoặc nồi chiên không dầu ở mức nhiệt cao nhất trong 3-4 phút.",
      tips: "Nếu muốn làm món hải sản nướng phô mai kéo sợi, hãy thêm chút phô mai Mozzarella. Có thể để trong tủ đông để HSD được 6 tháng.",
      storage: COMMON_STORAGE,
      shelf_life: SHELF_LIFE,
      pricing_tiers: [
        { format: "Gói 150g", price: 80000 },
        {
          format: "Combo 3 gói 150g + tặng sốt ớt xanh 75ml",
          price: 210000,
        },
        {
          format: "Combo 5 gói 150g + tặng cốt lẩu Thái",
          price: 350000,
        },
        { format: "Hũ 250g", price: 105000 },
        { format: "Hũ 500g", price: 195000 },
      ],
    },
  },
  {
    name: "Sốt Trứng Muối",
    other_name: null,
    description:
      "Sản phẩm best seller. Sốt trứng muối với lòng đỏ trứng muối tự ủ trong 40 ngày liên tục.",
    category: "Sốt chấm",
    price: 65000,
    attributes: {
      ingredients:
        "Lòng đỏ trứng muối (tự ủ trong 40 ngày liên tục), Bơ thơm, Cốt dừa, Mắm, Đường trắng, Tương ớt",
      packaging: "Gói 150g",
      recipes: [
        "Hải sản sốt trứng muối (Ốc hương, Ngao, Tôm, Cua, Cá hồi, Mực)",
        "Đậu hũ chiên sốt trứng muối",
        "Gà / Thịt lợn chiên lắc sốt trứng muối",
        "Thịt nướng chấm sốt trứng muối",
      ],
      usage_instructions:
        "Lắc đều trước khi sử dụng. Làm sốt chấm: Dùng trực tiếp hoặc hâm nóng bằng hấp cách thuỷ / lò vi sóng 15-20s, hoặc đặt trực tiếp lên giấy bạc nướng cùng thịt. Làm sốt nướng: Đun sốt to lửa và khuấy liên tục, khi sốt sôi thì cho nguyên liệu đã chín vào đảo đều đến khi đạt độ sệt nhất định.",
      tips: "Nếu sốt bị tách bơ, hãy thêm khoảng 50ml nước và đun to lửa rồi khuấy thật đều tay. Có thể pha thêm sữa tươi không đường để món ăn thêm béo ngậy. Ngon hơn khi chấm sốt với bánh mì.",
      storage: COMMON_STORAGE,
      shelf_life: SHELF_LIFE,
      special_notes:
        "Khi nhận hàng, sản phẩm có thể bị tách lớp nhẹ, là hiện tượng tự nhiên do phối trộn nguyên liệu tươi, không ảnh hưởng đến chất lượng sản phẩm.",
      pricing_tiers: [
        { format: "Gói 150g", price: 65000 },
        {
          format: "Combo 3 gói 150g + tặng sốt ớt xanh 75ml",
          price: 165000,
        },
        {
          format: "Combo 5 gói 150g + tặng cốt lẩu Thái",
          price: 275000,
        },
        { format: "Hũ 250g", price: 75000 },
        { format: "Hũ 500g", price: 135000 },
      ],
    },
  },
  {
    name: "Sốt Bơ Tỏi",
    other_name: null,
    description:
      "Sản phẩm best seller. Sốt bơ tỏi dùng cho các món hải sản, mì Ý, tokbokki, nướng, chấm.",
    category: "Sốt chấm",
    price: 60000,
    attributes: {
      ingredients: "Bơ, Cốt dừa, Mắm, Tương ớt, Đường trắng",
      packaging: "Gói 150g",
      recipes: [
        "Hải sản sốt bơ tỏi (Ốc hương, Ngao, Tôm, Cua, Cá hồi, Mực)",
        "Mì Ý / nui sốt bơ tỏi",
        "Tokbokki sốt bơ tỏi",
        "Đậu hũ chiên sốt bơ tỏi",
        "Gà / Thịt lợn chiên lắc sốt bơ tỏi",
        "Thịt nướng chấm sốt bơ tỏi",
      ],
      usage_instructions:
        "Lắc đều trước khi sử dụng. Làm sốt chấm: Dùng trực tiếp hoặc hâm nóng bằng hấp cách thuỷ / lò vi sóng 15-20s. Làm sốt nướng: Đun sốt to lửa và khuấy liên tục, khi sốt sôi thì cho nguyên liệu đã chín vào đảo đều đến khi đạt độ sệt nhất định.",
      tips: "Nếu sốt bị tách bơ, hãy thêm khoảng 50ml nước và đun to lửa rồi khuấy thật đều tay. Có thể pha thêm sữa tươi không đường để món ăn thêm béo ngậy. Ngon hơn khi chấm sốt với bánh mì.",
      storage: COMMON_STORAGE,
      shelf_life: SHELF_LIFE,
      special_notes:
        "Khi nhận hàng, sản phẩm có thể bị tách lớp nhẹ, là hiện tượng tự nhiên do phối trộn nguyên liệu tươi, không ảnh hưởng đến chất lượng sản phẩm.",
      pricing_tiers: [
        { format: "Gói 150g", price: 60000 },
        {
          format: "Combo 3 gói 150g + tặng sốt ớt xanh 75ml",
          price: 150000,
        },
        {
          format: "Combo 5 gói 150g + tặng cốt lẩu Thái",
          price: 250000,
        },
        { format: "Hũ 250g", price: 70000 },
        { format: "Hũ 500g", price: 125000 },
      ],
    },
  },
  {
    name: "Sốt Me",
    other_name: null,
    description:
      "Sản phẩm có tính ứng dụng cực kì cao, dễ làm tại nhà. Các món nướng, xào, chấm, ướp đều có thể dùng sốt me.",
    category: "Sốt chấm",
    price: 35000,
    attributes: {
      ingredients: "Me, Đường vàng, Tương ớt, Nước mắm",
      packaging: "Gói 150g",
      recipes: [
        "Tôm rang me",
        "Nghệ hấp sốt me, chấm bánh mì",
        "Cánh gà chiên giòn sốt me",
        "Ba chỉ nướng sốt me",
        "Cút lộn xào me",
        "Gỏi xoài xanh tôm khô sốt me cay ngọt",
        "Gỏi bò khô sốt me chua ngọt",
        "Sườn heo nướng sốt me",
        "Bò cuốn nấm kim châm nướng sốt me",
      ],
      usage_instructions:
        "Món nướng: Phết một lớp me lên thịt cho thịt được mềm, có màu sắc bắt mắt. Khi ướp nướng, có thể trộn thêm tỏi, đường, dầu hào, mật ong. Món hải sản: Ướp sốt me giúp khử tanh, có thể thêm gừng và rượu trắng. Món gỏi: 2 muỗng sốt me + 1 muỗng nước mắm + 1 muỗng đường + tỏi ớt bằm, dưới lên gỏi.",
      tips: "Lắc đều trước khi sử dụng. Ngon hơn khi chấm sốt với bánh mì.",
      storage: COMMON_STORAGE,
      shelf_life: SHELF_LIFE,
      pricing_tiers: [
        { format: "Gói 150g", price: 35000 },
        {
          format: "Combo 3 gói 150g + tặng sốt ớt xanh 75ml",
          price: 75000,
        },
        {
          format: "Combo 5 gói 150g + tặng cốt lẩu Thái",
          price: 125000,
        },
        { format: "Hũ 250g", price: 45000 },
        { format: "Hũ 500g", price: 75000 },
      ],
    },
  },
  {
    name: "Sốt Chanh Leo",
    other_name: null,
    description:
      "Sản phẩm có tính ứng dụng cao. Làm các món sốt nấu xào hoặc trộn salad healthy đều ngon. Dạng hũ tiện lợi.",
    category: "Sốt nướng/xào",
    price: 50000,
    attributes: {
      ingredients: "Chanh leo, Kem tươi, Đường, Bơ",
      packaging: "Chai 330ml",
      recipes: [
        "Tôm nướng sốt chanh leo bơ tỏi",
        "Hàu nướng phô mai sốt chanh leo",
        "Mực nướng sốt chanh leo",
        "Gà xào sốt chanh leo",
        "Ức gà áp chảo sốt chanh leo",
        "Bít tết áp chảo sốt chanh leo",
        "Salad tôm bơ sốt chanh leo",
        "Salad ức gà áp chảo chanh leo",
        "Salad mix các loại hoa quả với sốt chanh leo",
      ],
      usage_instructions:
        "Sau khi chế biến xong các món gà, cá hoặc hải sản (như nướng, chiên, hoặc áp chảo), rưới sốt chanh leo đã đun nóng lên món ăn. Nên để khoảng 15-20 phút để sốt ngấm vào thịt.",
      storage: COMMON_STORAGE,
      shelf_life: SHELF_LIFE,
      pricing_tiers: [
        { format: "Hũ 250g", price: 50000 },
        { format: "Hũ 500g", price: 85000 },
      ],
    },
  },
  {
    name: "Sốt Muối Ớt Xanh",
    other_name: "Sốt chấm hải sản",
    description:
      "Sản phẩm có tính ứng dụng cao - Chấm cả thế giới đều ngon. Vị cay mặn vừa phải, mùi lá chanh thái và ớt kim xanh rất thơm.",
    category: "Sốt chấm",
    price: 55000,
    attributes: {
      ingredients:
        "Ớt kim, Lá giang, Lá chanh Thái (siêu thơm), Đường, Mì chính, Muối, Mù tạt (lượng rất ít)",
      packaging: "Chai 330ml",
      recipes: [
        "Chấm hải sản (tôm, cua, ghẹ, ốc, mực)",
        "Chấm salad hải sản",
        "Chấm các món nướng, chiên, quay, luộc (thịt gà, heo, bò)",
        "Chấm rau luộc",
        "Tẩm ướp hải sản trước khi nướng",
      ],
      usage_instructions:
        "Dùng trực tiếp để chấm hoặc tẩm ướp các loại hải sản trước khi nướng. Có thể sử dụng làm sốt chấm cho các loại salad hải sản, các món nướng, chiên, quay, luộc.",
      storage: COMMON_STORAGE,
      shelf_life: SHELF_LIFE,
      special_notes:
        "Khi nhận hàng, sản phẩm có thể bị tách lớp nhẹ, là hiện tượng tự nhiên do phối trộn nguyên liệu tươi, không ảnh hưởng đến chất lượng sản phẩm.",
      pricing_tiers: [
        { format: "Hũ 250g", price: 55000 },
        { format: "Hũ 500g", price: 95000 },
      ],
    },
  },
  {
    name: "Sốt Ớt Đỏ",
    other_name: "Sốt chấm lẩu nướng",
    description:
      "Sản phẩm có tính ứng dụng cao - Chấm cả thế giới đều ngon. Sốt ớt đỏ dùng cho các món nướng, chiên, xào, rim.",
    category: "Sốt chấm",
    price: 55000,
    attributes: {
      ingredients:
        "Ớt sừng, Cốt quất, Mắm, Tỏi, Đường, Mì chính, Muối, Mù tạt (lượng rất ít)",
      packaging: "Chai 330ml",
      recipes: [
        "Cánh gà chiên giòn sốt ớt đỏ",
        "Bạch tuộc nướng cay",
        "Bánh mì nướng muối ớt đỏ",
        "Mực xào sốt ớt đỏ",
        "Đậu hũ chiên xốt ớt đỏ",
        "Thịt ba chỉ rim ớt đỏ",
      ],
      usage_instructions:
        "Sử dụng trực tiếp sốt ớt đỏ làm nước chấm cho các món ăn. Có thể pha loãng với nước cốt chanh, thêm tỏi và đường. Trộn sốt ớt đỏ với gia vị khác (tỏi, hành, nước mắm, đường) để làm nước ướp cho thịt, hải sản (để 15-20 phút cho ngấm).",
      storage: COMMON_STORAGE,
      shelf_life: SHELF_LIFE,
      special_notes:
        "Khi nhận hàng, sản phẩm có thể bị tách lớp nhẹ, là hiện tượng tự nhiên do phối trộn nguyên liệu tươi, không ảnh hưởng đến chất lượng sản phẩm.",
      pricing_tiers: [
        { format: "Hũ 250g", price: 55000 },
        { format: "Hũ 500g", price: 95000 },
      ],
    },
  },
  {
    name: "Sốt Cay",
    other_name: "Sốt Nướng Muối Ớt",
    description:
      "Tên là sốt cay nhưng không cay, người không ăn được cay vẫn ăn được. Dùng làm nước chấm cho các món chiên, nướng, hấp, hoặc ướp thịt.",
    category: "Sốt chấm",
    price: 45000,
    attributes: {
      ingredients:
        "Ớt kim, Ớt sừng, Hành, Tỏi, Mắm, Dầu ăn, Đường, Mì chính, Muối",
      packaging: "Chai 330ml",
      recipes: [
        "Nước chấm cho các món chiên, nướng, hấp (thịt, hải sản, rau củ)",
        "Ướp thịt, gà, cá, hải sản trước khi nướng, chiên hoặc xào",
        "Xào rau củ, thịt, hải sản",
      ],
      usage_instructions:
        "Rót sốt cay trực tiếp ra chén và dùng làm nước chấm. Có thể pha thêm chút nước chanh, tỏi bằm và đường nếu muốn giảm độ cay. Sử dụng sốt cay để ướp thịt, hải sản trước khi nướng, chiên hoặc xào (ướp khoảng 15-30 phút). Thêm sốt cay vào chảo trong quá trình xào rau củ, thịt hoặc hải sản.",
      storage: COMMON_STORAGE,
      shelf_life: SHELF_LIFE,
      pricing_tiers: [
        { format: "Hũ 250g", price: 45000 },
        { format: "Hũ 500g", price: 75000 },
      ],
    },
  },
  {
    name: "Mắm Chấm Ốc",
    other_name: null,
    description:
      "Tên là mắm chấm ốc nhưng chấm cả thế giới đều ngon. Mắm chấm truyền thống với vị đậm đà.",
    category: "Mắm chấm",
    price: 45000,
    attributes: {
      ingredients: "Mắm, Tỏi, Sả, Gừng, Ớt kim, Đường vàng, Dấm trắng",
      packaging: "Chai 330ml",
      recipes: [
        "Chấm ốc, cua, ghẹ, hải sản",
        "Chấm cơm tấm sườn nướng",
        "Chấm gỏi",
        "Chấm cá chiên",
      ],
      usage_instructions:
        "Khuấy/lắc đều trước khi dùng, dùng trực tiếp. Ngon nhất khi chấm với ốc, cua, ghẹ, hải sản, cơm tấm sườn nướng, gỏi hoặc cá chiên.",
      storage: COMMON_STORAGE,
      shelf_life: SHELF_LIFE,
      pricing_tiers: [
        { format: "Hũ 250g", price: 45000 },
        { format: "Hũ 500g", price: 75000 },
      ],
    },
  },
  {
    name: "Sốt Dầu Giấm Trộn Salad",
    other_name: null,
    description: "Sốt dầu giấm dùng để trộn salad, ướp thịt nướng, chấm hải sản.",
    category: "Sốt trộn",
    price: 45000,
    attributes: {
      ingredients: "Dấm, Đường, Mắm, Tỏi bóc, Ớt kim, Tương ớt",
      packaging: "Chai 330ml",
      recipes: [
        "Trộn salad",
        "Ướp thịt nướng",
        "Chấm hải sản",
      ],
      usage_instructions: "Trộn với salad. Ướp với thịt làm các món nướng.",
      storage: COMMON_STORAGE,
      shelf_life: SHELF_LIFE,
      pricing_tiers: [
        { format: "Hũ 250g", price: 45000 },
        { format: "Hũ 500g", price: 75000 },
      ],
    },
  },
  {
    name: "Sốt Cháy Tỏi",
    other_name: null,
    description:
      "Sản phẩm có tính ứng dụng cực kì cao, dễ làm tại nhà. Các món nướng, xào, chấm, ướp đều có thể dùng sốt cháy tỏi.",
    category: "Sốt nướng/xào",
    price: 45000,
    attributes: {
      ingredients: "Tỏi, Ớt, Đường, Nước mắm",
      packaging: "Chai 330ml",
      recipes: [
        "Xào thịt, hải sản, rau củ",
        "Phết lên bề mặt các món nướng",
        "Ướp thịt",
        "Phết lên bánh mì trước hoặc sau khi nướng",
      ],
      usage_instructions:
        "Khi làm món xào, thêm sốt vào chảo và đảo đều khi nguyên liệu đã chín. Phết lên bánh mì trước hoặc sau khi nướng. Phết trực tiếp lên thịt, hải sản, rau củ nướng.",
      storage: COMMON_STORAGE,
      shelf_life: SHELF_LIFE,
      pricing_tiers: [
        { format: "Hũ 250g", price: 45000 },
        { format: "Hũ 500g", price: 75000 },
      ],
    },
  },
  {
    name: "Sốt Chiên Mắm",
    other_name: null,
    description:
      "Sản phẩm có tính ứng dụng cực kì cao, dễ làm tại nhà. Các món nướng, xào, chấm, ướp đều có thể dùng sốt chiên mắm.",
    category: "Sốt nướng/xào",
    price: 45000,
    attributes: {
      ingredients: "Đường, Dấm, Bột ớt, Hạt tiêu, Nước mắm",
      packaging: "Chai 330ml",
      recipes: [
        "Gà chiên mắm tỏi",
        "Tôm rim mắm tỏi",
        "Đậu hũ chiên mắm",
      ],
      usage_instructions:
        "Phi tỏi thơm, đun sốt tới lửa và khuấy liên tục, khi sốt gần sôi thì cho thực phẩm đã được làm chín vào đảo đến khi cạn.",
      storage: COMMON_STORAGE,
      shelf_life: SHELF_LIFE,
      pricing_tiers: [
        { format: "Hũ 250g", price: 45000 },
        { format: "Hũ 500g", price: 75000 },
      ],
    },
  },
];

async function main() {
  console.log("Seeding 14 Sốt Dung Mama products into Supabase...\n");

  const rows = products.map((p) => ({
    name: p.name,
    other_name: p.other_name,
    description: p.description,
    category: p.category,
    brand: BRAND,
    price: p.price,
    status: "active",
    attributes: p.attributes,
  }));

  const { data, error } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "name" })
    .select("id, name, price");

  if (error) {
    console.error("Upsert failed:", error);
    process.exit(1);
  }

  console.log(`Successfully upserted ${data.length} products:\n`);
  for (const row of data) {
    console.log(`  [${row.id}] ${row.name} — ${row.price?.toLocaleString()}đ`);
  }

  console.log("\nDone! Run the sync script next to push to Nhanh.vn:");
  console.log("  npx tsx src/scripts/sync-products-to-nhanh.ts");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
