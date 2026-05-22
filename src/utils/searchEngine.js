import { chapters } from '../data/chapters.js';

import phanChung from '../data/ocr/phan_chung.md?raw';
import thuLiem from '../data/ocr/thu_liem.md?raw';
import chatNhay from '../data/ocr/chat_nhay.md?raw';
import tinhDau from '../data/ocr/tinh_dau.md?raw';
import giunSan from '../data/ocr/giun_san.md?raw';
import chuaLy from '../data/ocr/chua_ly.md?raw';
import glycosid from '../data/ocr/glycosid.md?raw';
import alcaloid from '../data/ocr/alcaloid.md?raw';
import saponin from '../data/ocr/saponin.md?raw';
import haHuyetAp from '../data/ocr/ha_huyet_ap.md?raw';
import docTinh from '../data/ocr/doc_tinh.md?raw';

const markdownMap = {
  'phan_chung': phanChung,
  'thu_liem': thuLiem,
  'chat_nhay': chatNhay,
  'tinh-dau': tinhDau,
  'giun-san': giunSan,
  'chua-ly': chuaLy,
  'glycosid': glycosid,
  'alcaloid': alcaloid,
  'saponin': saponin,
  'ha-huyet-ap': haHuyetAp,
  'doc-tinh': docTinh,
};

/**
 * SearchEngine - Hệ thống tra cứu đa tầng cho Bách Thảo Kính
 */
export const SearchEngine = {
  /**
   * Tìm kiếm vị thuốc theo từ khóa (Tên VN, Latin, Hán, Công năng)
   */
  searchHerbs: (query, herbsData = []) => {
    if (!query) return herbsData;
    const lowerQuery = query.toLowerCase().trim();
    
    return herbsData.filter(herb => 
      herb.name_vn.toLowerCase().includes(lowerQuery) ||
      herb.name_han.toLowerCase().includes(lowerQuery) ||
      herb.scientific_name.toLowerCase().includes(lowerQuery) ||
      herb.category.toLowerCase().includes(lowerQuery) ||
      herb.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },

  /**
   * Lấy vị thuốc theo Chương (Phân loại theo sách Đỗ Tất Lợi)
   */
  getHerbsByChapter: (chapterId, herbsData = []) => {
    return herbsData.filter(herb => herb.chapter_id === chapterId);
  },

  /**
   * Tra cứu thông tin Chương
   */
  getChapterInfo: (chapterId) => {
    return chapters.find(c => c.id === chapterId);
  },

  /**
   * Tìm kiếm nâng cao kết hợp nhiều tiêu chí
   */
  advancedSearch: (criteria, herbsData = []) => {
    const { query, chapterId, properties, safetyLevel } = criteria;
    let results = herbsData;

    if (query) results = SearchEngine.searchHerbs(query, herbsData);
    if (chapterId) results = results.filter(h => h.chapter_id === chapterId);
    if (properties) results = results.filter(h => h.properties.includes(properties));
    if (safetyLevel) results = results.filter(h => h.safety_level === safetyLevel);

    return results;
  },

  /**
   * Tìm xem vị thuốc có được nhắc đến trong chương OCR nào không
   */
  findMentionedChapters: (herbName) => {
    if (!herbName) return [];
    const upperName = herbName.toUpperCase();
    const results = [];
    
    for (const [chapterId, content] of Object.entries(markdownMap)) {
      if (content && content.toUpperCase().includes(upperName)) {
        const chapterInfo = chapters.find(c => c.id === chapterId);
        if (chapterInfo) results.push(chapterInfo);
      }
    }
    return results;
  }
};
