const fs = require('fs');
const path = require('path');

const HERBS_PATH = path.resolve(__dirname, '../src/data/herbs.js');
const TEMP_PATH = path.resolve(__dirname, 'temp_dedup.cjs');

if (fs.existsSync(HERBS_PATH)) {
  let content = fs.readFileSync(HERBS_PATH, 'utf8');
  let jsContent = content.replace('export const herbs =', 'module.exports =');
  fs.writeFileSync(TEMP_PATH, jsContent, 'utf8');
  
  const herbs = require('./temp_dedup.cjs');
  fs.unlinkSync(TEMP_PATH);

  const nameGroups = {};
  herbs.forEach(h => {
    const name = h.name_vn.trim().toLowerCase();
    if (!nameGroups[name]) nameGroups[name] = [];
    nameGroups[name].push(h);
  });

  const getScore = (h) => {
    let score = 0;
    if (h.detailed_usage) score += h.detailed_usage.length;
    if (h.theoretical_basis) score += h.theoretical_basis.length;
    if (h.tcm_effects) score += h.tcm_effects.length;
    if (h.modern_effects) score += h.modern_effects.length;
    if (h.usage_summary) score += h.usage_summary.length;
    // Điểm cộng nếu có ảnh đã tạo (không bắt đầu bằng http hoặc chưa có)
    if (h.image && !h.image.startsWith('http') && h.image.startsWith('/images/')) score += 1000;
    return score;
  };

  const finalHerbs = [];
  let removedCount = 0;

  for (const name in nameGroups) {
    const group = nameGroups[name];
    if (group.length > 1) {
      // Sắp xếp giảm dần theo điểm độ dài nội dung
      group.sort((a, b) => getScore(b) - getScore(a));
      removedCount += (group.length - 1);
    }
    // Giữ lại bản ghi tốt nhất đầu tiên
    finalHerbs.push(group[0]);
  }

  // Khôi phục lại ID theo thứ tự mới để gọn gàng
  finalHerbs.forEach((h, idx) => {
    h.id = idx + 1;
  });

  const newContent = 'export const herbs = ' + JSON.stringify(finalHerbs, null, 2) + ';\n';
  fs.writeFileSync(HERBS_PATH, newContent, 'utf8');
  
  console.log(`Đã lược bỏ thành công ${removedCount} bản ghi trùng lặp.`);
  console.log(`Số lượng thảo dược hiện tại trong cơ sở dữ liệu: ${finalHerbs.length}`);
} else {
  console.error('Không tìm thấy herbs.js');
}
