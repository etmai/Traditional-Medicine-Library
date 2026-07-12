import React, { useState, useEffect, useMemo } from 'react';
import { meridians } from '../data/meridians';
import { acupoints } from '../data/acupoints';
import './MeridianLibrary.css';

function MeridianLibrary({ initialMeridianId, herbs = [], onSelectHerb }) {
  const [activeMeridianId, setActiveMeridianId] = useState(initialMeridianId || 'lu');
  const [expandedAcupointId, setExpandedAcupointId] = useState(null);

  // Sync with initialMeridianId when it changes from props
  useEffect(() => {
    if (initialMeridianId) {
      setActiveMeridianId(initialMeridianId);
    }
  }, [initialMeridianId]);

  const activeMeridian = useMemo(() => {
    return meridians.find(m => m.id === activeMeridianId) || meridians[0];
  }, [activeMeridianId]);

  const activeAcupoints = useMemo(() => {
    return acupoints.filter(a => a.meridian_id === activeMeridianId);
  }, [activeMeridianId]);

  // Filter herbs that have this meridian in their quy_kinh
  // In the database, quy_kinh might be in Vietnamese (e.g. "Phế", "Tỳ", "Thận", "Đại trường")
  // Let's create a map to match the meridian id or abbr to the Vietnamese terms
  const relatedHerbs = useMemo(() => {
    if (!herbs.length) return [];
    
    const meridianNameMap = {
      lu: ["phế", "phế kinh"],
      li: ["đại trường", "đại tràng"],
      st: ["vị", "vị kinh", "dạ dày"],
      sp: ["tỳ", "tỳ kinh", "lá lách"],
      ht: ["tâm", "tâm kinh", "tim"],
      si: ["tiểu trường", "tiểu tràng", "ruột non"],
      bl: ["bàng quang", "bàng quang kinh", "bọng đái"],
      ki: ["thận", "thận kinh"],
      pc: ["tâm bào", "tâm bào lạc", "tâm bào kinh"],
      te: ["tam tiêu", "tam tiêu kinh"],
      gb: ["đởm", "đởm kinh", "mật"],
      lr: ["can", "can kinh", "gan"],
      cv: ["nhâm", "nhâm mạch", "mạch nhâm"],
      gv: ["đốc", "đốc mạch", "mạch đốc"]
    };

    const targetTerms = meridianNameMap[activeMeridianId] || [];

    return herbs.filter(herb => {
      if (!herb.meridians) return false;
      // Convert to lowercase array or string for scanning
      const tropismStr = String(herb.meridians).toLowerCase();
      return targetTerms.some(term => tropismStr.includes(term));
    });
  }, [activeMeridianId, herbs]);

  const getElementColorClass = (element) => {
    switch (element) {
      case 'Kim': return 'el-metal';
      case 'Mộc': return 'el-wood';
      case 'Thủy': return 'el-water';
      case 'Hỏa': return 'el-fire';
      case 'Thổ': return 'el-earth';
      default: return 'el-extra';
    }
  };

  const toggleAcupoint = (id) => {
    if (expandedAcupointId === id) {
      setExpandedAcupointId(null);
    } else {
      setExpandedAcupointId(id);
    }
  };

  return (
    <main className="content-page container fade-in">
      <div className="meridian-layout">
        
        {/* Left Sidebar: Meridian List */}
        <aside className="meridian-sidebar">
          <h3 className="sidebar-title">Hệ Thống Kinh Lạc</h3>
          <div className="meridian-nav-group">
            <span className="group-label">12 Đường Kinh Chính</span>
            <ul className="meridian-list">
              {meridians.slice(0, 12).map((m) => (
                <li key={m.id}>
                  <button
                    className={`meridian-btn ${activeMeridianId === m.id ? 'active' : ''} ${getElementColorClass(m.element)}`}
                    onClick={() => {
                      setActiveMeridianId(m.id);
                      setExpandedAcupointId(null);
                    }}
                    type="button"
                  >
                    <span className="meridian-abbr-badge">{m.abbr}</span>
                    <div className="meridian-btn-info">
                      <span className="meridian-btn-name">{m.name_vn}</span>
                      <span className="meridian-btn-meta">{m.element} • {m.time.split(' ')[0]}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            <span className="group-label">Kỳ Kinh Bát Mạch</span>
            <ul className="meridian-list">
              {meridians.slice(12).map((m) => (
                <li key={m.id}>
                  <button
                    className={`meridian-btn ${activeMeridianId === m.id ? 'active' : ''} el-extra`}
                    onClick={() => {
                      setActiveMeridianId(m.id);
                      setExpandedAcupointId(null);
                    }}
                    type="button"
                  >
                    <span className="meridian-abbr-badge">{m.abbr}</span>
                    <div className="meridian-btn-info">
                      <span className="meridian-btn-name">{m.name_vn}</span>
                      <span className="meridian-btn-meta">{m.element}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Right Content Panel: Meridian Details & Acupoints */}
        <section className="meridian-content">
          
          {/* Header Card */}
          <div className={`meridian-header-card ${getElementColorClass(activeMeridian.element)}`}>
            <div className="header-meta">
              <span className="meridian-abbr-large">{activeMeridian.abbr}</span>
              <div className="header-title-section">
                <span className="zh-name">{activeMeridian.name_zh}</span>
                <h2 className="vn-name">{activeMeridian.name_vn}</h2>
              </div>
            </div>
            
            <div className="meridian-stats-grid">
              <div className="stat-item">
                <span className="stat-label">Hành (Ngũ Hành)</span>
                <span className="stat-value">{activeMeridian.element}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Giờ Vượng Kinh</span>
                <span className="stat-value">{activeMeridian.time}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Huyệt Chủ Chốt</span>
                <span className="stat-value">{activeAcupoints.length} Huyệt vị chính</span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="details-card">
            <h3 className="section-title-underlined">Lộ Trình Vận Hành</h3>
            <p className="pathway-text">{activeMeridian.pathway}</p>

            <h3 className="section-title-underlined">Chủ Trị Lâm Sàng</h3>
            <p className="indications-text">{activeMeridian.indications}</p>
          </div>

          {/* Acupoints Accordion */}
          <div className="acupoints-section">
            <h3 className="section-title-main">Hồ Sơ Huyệt Vị Trọng Yếu</h3>
            {activeAcupoints.length === 0 ? (
              <div className="empty-acupoints">
                <p>Đang cập nhật hồ sơ huyệt vị chi tiết cho đường kinh này.</p>
              </div>
            ) : (
              <div className="acupoint-accordion-group">
                {activeAcupoints.map((ap) => (
                  <div key={ap.id} className={`acupoint-card ${expandedAcupointId === ap.id ? 'open' : ''}`}>
                    <button
                      className="acupoint-toggle-header"
                      onClick={() => toggleAcupoint(ap.id)}
                      type="button"
                    >
                      <div className="acupoint-header-info">
                        <span className="acupoint-code">{ap.id.toUpperCase()}</span>
                        <span className="acupoint-name">{ap.name_vn}</span>
                        <span className="acupoint-zh">{ap.name_zh}</span>
                      </div>
                      <span className="toggle-indicator">{expandedAcupointId === ap.id ? '−' : '+'}</span>
                    </button>
                    
                    {expandedAcupointId === ap.id && (
                      <div className="acupoint-detail-body fade-in">
                        <div className="acupoint-field">
                          <strong>📍 Vị trí xác định:</strong>
                          <p>{ap.location}</p>
                        </div>
                        <div className="acupoint-field">
                          <strong>🩹 Chủ trị:</strong>
                          <p>{ap.indications}</p>
                        </div>
                        <div className="acupoint-field">
                          <strong>⚡ Cách tác động / Châm cứu:</strong>
                          <p>{ap.method}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Herbs */}
          <div className="related-herbs-section">
            <h3 className="section-title-main">Vị Thuốc Quy Kinh Này ({relatedHerbs.length})</h3>
            {relatedHerbs.length === 0 ? (
              <div className="empty-state-herbs">
                <p>Chưa có vị thuốc nào quy kinh này trong kho dữ liệu thảo dược hiện tại.</p>
              </div>
            ) : (
              <div className="related-herbs-grid">
                {relatedHerbs.map((herb) => (
                  <button
                    key={herb.id}
                    className="related-herb-chip"
                    onClick={() => onSelectHerb && onSelectHerb(herb)}
                    type="button"
                  >
                    <span className="herb-chip-avatar" style={{ backgroundImage: `url(${herb.image})` }} />
                    <div className="herb-chip-info">
                      <span className="herb-chip-name">{herb.name_vn}</span>
                      <span className="herb-chip-taste">{herb.taste} • {herb.properties}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </section>
      </div>
    </main>
  );
}

export default MeridianLibrary;
