import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { chapters } from '../data/chapters';
import './BookLibrary.css';

// Import raw markdown files using Vite's ?raw syntax
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

const BookLibrary = ({ initialChapter }) => {
  const [selectedChapter, setSelectedChapter] = useState(initialChapter || chapters[0].id);

  const handleChapterSelect = (id) => {
    setSelectedChapter(id);
    window.scrollTo(0, 0);
  };

  return (
    <div className="book-library container section fade-in">
      <header className="page-header" style={{ marginBottom: '32px' }}>
        <span className="eyebrow">Medical Foundations</span>
        <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Thư Viện Kiến Thức</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto' }}>
          Tập hợp các kiến thức chọn lọc và biên soạn về cơ sở lý luận Đông y, chẩn trị lâm sàng và bào chế từ Hải Thượng Y Tông Tâm Lĩnh và Nam Dược Thần Hiệu.
        </p>
      </header>

      <div className="book-layout">
        <aside className="book-sidebar">
          <h3 className="sidebar-title">Mục Lục Kiến Thức</h3>
          <ul className="chapter-list">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <button
                  className={`chapter-btn ${selectedChapter === chapter.id ? 'active' : ''}`}
                  onClick={() => handleChapterSelect(chapter.id)}
                  type="button"
                >
                  <span className="chapter-name">{chapter.title}</span>
                  <span className="chapter-desc">{chapter.description}</span>
                  <span className="chapter-pages" style={{ background: 'rgba(45, 90, 39, 0.1)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', alignSelf: 'flex-start', marginTop: '6px', fontWeight: 600 }}>
                    {chapter.page_range}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="book-content markdown-body glass" style={{ padding: '32px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.4)' }}>
          {markdownMap[selectedChapter] ? (
            <ReactMarkdown>{markdownMap[selectedChapter]}</ReactMarkdown>
          ) : (
            <div className="empty-state">
              <p>Nội dung đang được cập nhật...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BookLibrary;
