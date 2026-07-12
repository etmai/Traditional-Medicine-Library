import React, { useState, useEffect, useMemo } from 'react';
import { meridians } from '../data/meridians';
import { acupoints } from '../data/acupoints';
import './MeridianLibrary.css';

// SVG Coordinate Path mapping for 14 meridians on a stylized 2D body silhouette (300x500 viewport)
const meridianPaths = {
  lu: {
    points: "135,125 118,125 96,160 81,215 67,270 55,290",
    color: "#6b7280", // Gray for Metal
    acupoints: [
      { id: "lu-7", cx: 67, cy: 270, label: "Liệt Khuyết (LU7)" },
      { id: "lu-9", cx: 62, cy: 280, label: "Thái Uyên (LU9)" },
      { id: "lu-11", cx: 55, cy: 290, label: "Thiếu Thương (LU11)" }
    ]
  },
  li: {
    points: "57,290 69,270 78,215 89,165 106,125 118,105 132,80 144,65 146,55",
    color: "#4b5563", // Darker Gray for Metal (Yang)
    acupoints: [
      { id: "li-4", cx: 69, cy: 270, label: "Hợp Cốc (LI4)" },
      { id: "li-11", cx: 78, cy: 215, label: "Khúc Trì (LI11)" },
      { id: "li-20", cx: 146, cy: 55, label: "Nghinh Hương (LI20)" }
    ]
  },
  st: {
    points: "145,50 135,78 135,115 135,160 135,270 131,335 125,410 125,480",
    color: "#d97706", // Orange for Earth
    acupoints: [
      { id: "st-36", cx: 125, cy: 410, label: "Túc Tam Lý (ST36)" },
      { id: "st-25", cx: 135, cy: 200, label: "Thiên Khu (ST25)" }
    ]
  },
  sp: {
    points: "115,480 119,425 119,390 121,325 123,240 123,170 115,125",
    color: "#f59e0b", // Yellow/Amber for Earth (Yin)
    acupoints: [
      { id: "sp-6", cx: 119, cy: 425, label: "Tam Âm Giao (SP6)" },
      { id: "sp-9", cx: 119, cy: 390, label: "Âm Lăng Tuyền (SP9)" }
    ]
  },
  ht: {
    points: "140,130 112,125 93,175 79,225 66,275 51,290",
    color: "#ef4444", // Red for Fire
    acupoints: [
      { id: "ht-7", cx: 66, cy: 275, label: "Thần Môn (HT7)" }
    ]
  },
  si: {
    points: "51,290 60,275 71,225 84,175 102,125 118,105 126,80 132,60",
    color: "#dc2626", // Dark Red for Fire (Yang)
    acupoints: [
      { id: "si-3", cx: 60, cy: 275, label: "Hậu Khê (SI3)" }
    ]
  },
  bl: {
    points: "145,45 150,22 153,45 158,80 162,150 162,280 171,335 174,380 180,430 185,480",
    color: "#3b82f6", // Blue for Water
    acupoints: [
      { id: "bl-23", cx: 162, cy: 195, label: "Thận Du (BL23)" },
      { id: "bl-40", cx: 174, cy: 380, label: "Ủy Trung (BL40)" }
    ]
  },
  ki: {
    points: "176,480 182,450 182,390 176,325 160,240 160,115",
    color: "#2563eb", // Royal Blue for Water (Yin)
    acupoints: [
      { id: "ki-1", cx: 176, cy: 475, label: "Dũng Tuyền (KI1)" },
      { id: "ki-3", cx: 182, cy: 450, label: "Thái Khê (KI3)" }
    ]
  },
  pc: {
    points: "145,130 112,120 91,165 77,220 67,272 54,290",
    color: "#b91c1c", // Crimson for Minister Fire
    acupoints: [
      { id: "pc-6", cx: 72, cy: 250, label: "Nội Quan (PC6)" }
    ]
  },
  te: {
    points: "52,290 62,272 73,250 73,220 86,165 103,120 118,100 130,75 137,45",
    color: "#991b1b", // Dark Crimson for Minister Fire (Yang)
    acupoints: [
      { id: "te-5", cx: 73, cy: 250, label: "Ngoại Quan (TE5)" }
    ]
  },
  gb: {
    points: "155,45 163,30 161,55 169,90 190,170 190,290 185,385 182,480",
    color: "#10b981", // Green for Wood
    acupoints: [
      { id: "gb-20", cx: 161, cy: 55, label: "Phong Trì (GB20)" },
      { id: "gb-34", cx: 185, cy: 385, label: "Dương Lăng Tuyền (GB34)" }
    ]
  },
  lr: {
    points: "115,480 118,450 118,375 125,285 130,150",
    color: "#059669", // Dark Green for Wood (Yin)
    acupoints: [
      { id: "lr-3", cx: 118, cy: 450, label: "Thái Xung (LR3)" }
    ]
  },
  cv: {
    points: "150,320 150,285 150,270 150,220 150,180 150,150 150,100 150,75",
    color: "#8b5cf6", // Purple for Extraordinary Vessel (Ren)
    acupoints: [
      { id: "cv-12", cx: 150, cy: 220, label: "Trung Quản (CV12)" },
      { id: "cv-6", cx: 150, cy: 270, label: "Khí Hải (CV6)" },
      { id: "cv-4", cx: 150, cy: 285, label: "Quan Nguyên (CV4)" },
      { id: "cv-17", cx: 150, cy: 150, label: "Đản Trung (CV17)" }
    ]
  },
  gv: {
    points: "150,320 150,250 150,200 150,150 150,95 150,50 150,22 148,42 150,68",
    color: "#7c3aed", // Violet for Extraordinary Vessel (Du)
    acupoints: [
      { id: "gv-20", cx: 150, cy: 22, label: "Bách Hội (GV20)" },
      { id: "gv-14", cx: 150, cy: 95, label: "Đại Chùy (GV14)" },
      { id: "gv-4", cx: 150, cy: 250, label: "Mệnh Môn (GV4)" }
    ]
  }
};

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

  const activePathData = useMemo(() => {
    return meridianPaths[activeMeridianId] || null;
  }, [activeMeridianId]);

  // Filter herbs that have this meridian in their quy_kinh
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

          {/* Meridian details grid layout */}
          <div className="meridian-details-grid">
            
            {/* Interactive SVG Body Map */}
            <div className="meridian-map-container glass">
              <h4 className="map-title">Đồ Hình Đường Kinh & Huyệt Vị</h4>
              
              <div className="svg-wrapper">
                <svg viewBox="0 0 300 500" width="100%" height="100%" className="human-body-svg">
                  {/* Head */}
                  <circle cx="150" cy="45" r="22" className="body-part" />
                  {/* Neck */}
                  <rect x="146" y="67" width="8" height="15" rx="3" className="body-part" />
                  {/* Torso */}
                  <path d="M 125,82 L 175,82 Q 198,90 195,120 L 188,300 Q 185,315 175,315 L 125,315 Q 115,315 112,300 L 105,120 Q 102,90 125,82 Z" className="body-part" />
                  {/* Left Arm */}
                  <path d="M 105,95 Q 80,95 72,130 L 51,280 Q 48,290 55,290 Q 62,290 65,280 L 88,140 Q 90,118 105,110 Z" className="body-part" />
                  {/* Right Arm */}
                  <path d="M 195,95 Q 220,95 228,130 L 249,280 Q 252,290 245,290 Q 238,290 235,280 L 212,140 Q 210,118 195,110 Z" className="body-part" />
                  {/* Left Leg */}
                  <path d="M 112,315 L 132,315 L 135,420 L 127,480 Q 126,488 120,488 Q 114,488 113,480 L 110,420 Z" className="body-part" />
                  {/* Right Leg */}
                  <path d="M 188,315 L 168,315 L 165,420 L 173,480 Q 174,488 180,488 Q 186,488 187,480 L 190,420 Z" className="body-part" />

                  {/* Meridian Active Path */}
                  {activePathData && (
                    <polyline
                      points={activePathData.points}
                      className="meridian-path-line"
                      style={{
                        stroke: activePathData.color,
                        filter: `drop-shadow(0 0 5px ${activePathData.color})`
                      }}
                    />
                  )}

                  {/* Acupoint Dots */}
                  {activePathData && activePathData.acupoints.map((ap) => (
                    <g key={ap.id} className="acupoint-dot-group" onClick={() => {
                      setExpandedAcupointId(ap.id);
                      const el = document.getElementById(`ap-${ap.id}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}>
                      <circle
                        cx={ap.cx}
                        cy={ap.cy}
                        r="9"
                        className="acupoint-hover-zone"
                      />
                      <circle
                        cx={ap.cx}
                        cy={ap.cy}
                        r="4"
                        className={`acupoint-core-dot ${expandedAcupointId === ap.id ? 'active' : ''}`}
                        style={{
                          fill: activePathData.color,
                          stroke: '#ffffff',
                          strokeWidth: 1.5,
                          filter: `drop-shadow(0 0 3px ${activePathData.color})`
                        }}
                      />
                      <title>{ap.label}</title>
                    </g>
                  ))}
                </svg>
              </div>

              <div className="map-legend">
                <span className="legend-info">💡 Click vào chấm tròn để xem vị trí & cách day bấm huyệt tương ứng</span>
              </div>
            </div>

            {/* Text details and accordions column */}
            <div className="meridian-text-details">
              
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
                      <div key={ap.id} id={`ap-${ap.id}`} className={`acupoint-card ${expandedAcupointId === ap.id ? 'open' : ''}`}>
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
                              <strong>⚡ Cách tác động / Bấm huyệt:</strong>
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

            </div>

          </div>

        </section>
      </div>
    </main>
  );
}

export default MeridianLibrary;
