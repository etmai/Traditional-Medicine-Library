/**
 * Bách Thảo Kính - Batch Herb Image Generator (Improved Prompt Logic)
 * 
 * Hướng dẫn sử dụng:
 * 1. Cài đặt các thư viện cần thiết:
 *    npm install dotenv node-fetch
 * 2. Đã hỗ trợ file Gen-Images.env. Bạn hãy dán nội dung sau vào file Gen-Images.env:
 *    OPENAI_API_KEY=your_key_here
 * 3. Chạy script:
 *    node scripts/generate_all_herb_images.cjs
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: fs.existsSync('Gen-Images.env') ? 'Gen-Images.env' : '.env' });

const API_KEY = process.env.OPENAI_API_KEY;
const HERBS_PATH = path.resolve(__dirname, '../src/data/herbs.js');
const TEMP_PATH = path.resolve(__dirname, 'temp_herbs.cjs');
const IMAGES_DIR = path.resolve(__dirname, '../public/images');

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

const translateToEnglish = (text) => {
  if (!text) return 'botanical details';
  const dict = {
    'Rễ': 'root',
    'Củ': 'root tuber',
    'Lá': 'leaves',
    'Hoa': 'flowers',
    'Quả': 'berries',
    'Hạt': 'seeds',
    'Cành': 'twigs',
    'Vỏ thân': 'bark',
    'Toàn cây': 'whole plant',
    'Rễ củ đã chế': 'prepared root tuber',
    'Thân rễ tươi': 'fresh aromatic rhizome',
    'Vỏ quả chín phơi lâu năm': 'dried aged peel',
    'Quả chín': 'ripe fruits'
  };
  return dict[text] || text;
};

async function main() {
  if (!fs.existsSync(HERBS_PATH)) {
    console.error('Không tìm thấy file dữ liệu thảo dược herbs.js');
    return;
  }

  let content = fs.readFileSync(HERBS_PATH, 'utf8');
  let jsContent = content.replace('export const herbs =', 'module.exports =');
  fs.writeFileSync(TEMP_PATH, jsContent, 'utf8');

  const herbs = require('./temp_herbs.cjs');
  fs.unlinkSync(TEMP_PATH);

  // Bộ lọc cập nhật: Kiểm tra nếu file ảnh chưa thực sự tồn tại trong thư mục public/images
  const pendingHerbs = herbs.filter(herb => {
    if (!herb.image) return true;
    const localImagePath = path.join(IMAGES_DIR, herb.image.replace('/images/', ''));
    return !fs.existsSync(localImagePath);
  });

  console.log(`Tổng số thảo dược trong danh sách: ${herbs.length}`);
  console.log(`Số thảo dược đã có ảnh cục bộ: ${herbs.length - pendingHerbs.length}`);
  console.log(`Số thảo dược đang đợi tạo ảnh: ${pendingHerbs.length}`);

  if (!API_KEY) {
    console.log('\n[LƯU Ý] Chưa phát hiện OPENAI_API_KEY trong file Gen-Images.env.');
    console.log('Dưới đây là danh sách Prompt gợi ý chi tiết (đã cải tiến) cho 5 thảo dược tiếp theo:');
    
    pendingHerbs.slice(0, 5).forEach(herb => {
      const partEng = translateToEnglish(herb.part_used);
      const prompt = `A highly detailed, scientifically accurate botanical watercolor illustration of ${herb.scientific_name} (${herb.name_vn}), depicting its ${partEng} and leaves. Vibrant yet muted traditional colors, rich textures, elegant thin ink brush strokes, delicate watercolor washes, soft shading, isolated on clean off-white parchment paper texture background, botanical plate style, East Asian medicine aesthetic.`;
      
      console.log(`\n- ${herb.name_vn} (${herb.scientific_name}):`);
      console.log(`  Tên file lưu: public/images/${herb.slug}.png`);
      console.log(`  Prompt: "${prompt}"`);
    });
    return;
  }

  console.log('\nBắt đầu tạo ảnh hàng loạt bằng API Key (Prompt nâng cao)...');
  
  for (const herb of pendingHerbs) {
    console.log(`Đang tạo ảnh cho: ${herb.name_vn}...`);
    const partEng = translateToEnglish(herb.part_used);
    const prompt = `A highly detailed, scientifically accurate botanical watercolor illustration of ${herb.scientific_name} (${herb.name_vn}), depicting its ${partEng} and leaves. Vibrant yet muted traditional colors, rich textures, elegant thin ink brush strokes, delicate watercolor washes, soft shading, isolated on clean off-white parchment paper texture background, botanical plate style, East Asian medicine aesthetic.`;
    
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          response_format: 'url'
        })
      });
      const data = await response.json();
      if(data.error) {
        console.error("API Error:", data.error);
        continue;
      }
      const imageUrl = data.data[0].url;
      
      const imgRes = await fetch(imageUrl);
      const buffer = await imgRes.arrayBuffer();
      fs.writeFileSync(path.join(IMAGES_DIR, `${herb.slug}.png`), Buffer.from(buffer));
      
      herb.image = `/images/${herb.slug}.png`;
      console.log(`-> Đã lưu ảnh: public/images/${herb.slug}.png`);
      
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`Lỗi khi tạo ảnh cho ${herb.name_vn}:`, err);
    }
  }

  const updatedContent = 'export const herbs = ' + JSON.stringify(herbs, null, 2) + ';\n';
  fs.writeFileSync(HERBS_PATH, updatedContent, 'utf8');
  console.log('Đã cập nhật tất cả đường dẫn ảnh mới vào file herbs.js!');
}

main().catch(console.error);
