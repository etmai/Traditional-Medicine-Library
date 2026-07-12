import React, { useMemo, useState } from 'react';
import { getPrescriptionsForHerb } from '../data/prescriptions';
import { getUseCaseShortLabel, safetyMeta } from '../data/taxonomy';
import { SearchEngine } from '../utils/searchEngine';

function HerbDetail({ herb, onBack, onNavigateToBook, onNavigateToMeridian }) {
  const [activeTab, setActiveTab] = useState('overview');
  const relatedPrescriptions = useMemo(() => (herb ? getPrescriptionsForHerb(herb.name_vn) : []), [herb]);
  const mentionedChapters = useMemo(() => (herb ? SearchEngine.findMentionedChapters(herb.name_vn) : []), [herb]);

  if (!herb) return null;

  const safety = safetyMeta[herb.safety_level] || safetyMeta.normal;
  const tabs = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'knowledge', label: 'Cơ sở Kiến thức' },
    { id: 'preparation', label: 'Bào chế & Cách dùng' },
    { id: 'combinations', label: 'Phối ngũ' },
    { id: 'prescriptions', label: 'Bài thuốc' },
    { id: 'sources', label: 'Nguồn' },
  ];

  return (
    <main className="herb-detail-page container fade-in content-page">
      <button className="back-link" onClick={onBack} type="button">
        Quay lại thư viện
      </button>

      <section className="detail-header">
        <div className="detail-image-wrap">
          <div className="detail-image" style={{ backgroundImage: `url(${herb.image})` }} />
          <span className={`safety-badge ${safety.tone}`}>{safety.label}</span>
        </div>

        <div className="detail-main-info">
          <span className="herb-han">{herb.name_han}</span>
          <h1>{herb.name_vn}</h1>
          <p className="latin-name">{herb.scientific_name}</p>
          <p className="lead-copy">{herb.detailed_usage || herb.basic_summary}</p>

          <div className={`alert-panel ${safety.tone}`}>
            <strong>{safety.label}</strong>
            <span>{safety.summary}</span>
          </div>

          <div className="info-grid">
            <div>
              <strong>Nhóm</strong>
              <span>{herb.category}</span>
            </div>
            <div>
              <strong>Bộ phận dùng</strong>
              <span>{herb.part_used}</span>
            </div>
            <div>
              <strong>Tính</strong>
              <span>{herb.properties}</span>
            </div>
            <div>
              <strong>Vị</strong>
              <span>{herb.taste}</span>
            </div>
            <div>
              <strong>Quy kinh</strong>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                {herb.meridians ? (
                  herb.meridians.split(',').map((name, i) => {
                    const cleanName = name.trim();
                    const getMeridianId = (n) => {
                      const normalized = n.toLowerCase();
                      if (normalized.includes("tâm bào")) return "pc";
                      if (normalized.includes("phế")) return "lu";
                      if (normalized.includes("đại trường") || normalized.includes("đại tràng")) return "li";
                      if (normalized.includes("vị") || normalized.includes("dạ dày")) return "st";
                      if (normalized.includes("tỳ") || normalized.includes("lá lách")) return "sp";
                      if (normalized.includes("tâm")) return "ht";
                      if (normalized.includes("tiểu trường") || normalized.includes("tiểu tràng")) return "si";
                      if (normalized.includes("bàng quang")) return "bl";
                      if (normalized.includes("thận")) return "ki";
                      if (normalized.includes("tam tiêu")) return "te";
                      if (normalized.includes("đởm") || normalized.includes("mật")) return "gb";
                      if (normalized.includes("can") || normalized.includes("gan")) return "lr";
                      if (normalized.includes("nhâm")) return "cv";
                      if (normalized.includes("đốc")) return "gv";
                      return null;
                    };
                    const mId = getMeridianId(cleanName);
                    if (mId && onNavigateToMeridian) {
                      return (
                        <button
                          key={i}
                          className="meridian-link-btn"
                          onClick={() => onNavigateToMeridian(mId)}
                          type="button"
                          style={{
                            background: 'rgba(107, 68, 35, 0.08)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            color: 'var(--primary-color)',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '12px',
                            transition: 'var(--transition)'
                          }}
                        >
                          {cleanName}
                        </button>
                      );
                    }
                    return <span key={i} className="prop-tag">{cleanName}</span>;
                  })
                ) : (
                  <span>Chưa xác định</span>
                )}
              </div>
            </div>
            <div>
              <strong>Nhu cầu</strong>
              <span>{herb.use_cases.map(getUseCaseShortLabel).join(', ')}</span>
            </div>
          </div>
        </div>
      </section>

      <nav className="detail-tabs" aria-label="Thông tin thảo dược">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="tab-content">
        {activeTab === 'overview' && (
          <div className="content-grid">
            <article>
              <h2>Công dụng</h2>
              <p>{herb.usage_summary}</p>
              <p>{herb.detailed_usage || herb.basic_summary}</p>
            </article>
            <aside className={`alert-panel ${safety.tone}`}>
              <h3>Kiêng kỵ & cảnh báo</h3>
              <p>{herb.warnings}</p>
            </aside>
            
            {mentionedChapters.length > 0 && (
              <div className="alert-panel neutral" style={{ marginTop: '1rem' }}>
                <h3>Được nhắc đến trong Thư Viện Kiến Thức</h3>
                <p>Vị thuốc này được đề cập lý luận trong các chương sau:</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {mentionedChapters.map(chapter => (
                    <button 
                      key={chapter.id} 
                      className="prop-tag accent" 
                      style={{ cursor: 'pointer', border: 'none', background: 'var(--primary-color)', color: 'white' }}
                      onClick={() => onNavigateToBook && onNavigateToBook(chapter.id)}
                    >
                      {chapter.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="content-grid">
            <article>
              <h2>Cơ sở lý luận</h2>
              <p>{herb.theoretical_basis || "Đang cập nhật nội dung từ các nguồn y văn cổ..."}</p>
            </article>
            <article>
              <h2>Tác dụng theo Đông y</h2>
              <p>{herb.tcm_effects || herb.usage_summary}</p>
            </article>
            <article>
              <h2>Tác dụng theo Khoa học hiện đại</h2>
              <p>{herb.modern_effects || "Đang cập nhật dữ liệu dược lý hiện đại..."}</p>
            </article>
          </div>
        )}

        {activeTab === 'preparation' && (
          <div className="content-grid">
            <article>
              <h2>Bào chế theo Đông y</h2>
              <p>{herb.tcm_preparation || herb.preparation}</p>
            </article>
            <article>
              <h2>Liều lượng tham khảo</h2>
              <p>{herb.dosage}</p>
            </article>
          </div>
        )}

        {activeTab === 'combinations' && (
          <div>
            <div className="combination-grid">
              {herb.combinations.map((combo) => (
                <article key={`${combo.name}-${combo.type}`} className={`combo-card ${combo.type === 'Tương phản' ? 'danger' : ''}`}>
                  <div>
                    <strong>{combo.name}</strong>
                    <span className="prop-tag">{combo.type}</span>
                  </div>
                  <p>{combo.note}</p>
                </article>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div>
            {relatedPrescriptions.length > 0 ? (
              <div className="prescription-grid compact">
                {relatedPrescriptions.map((prescription) => (
                  <article key={prescription.id} className="prescription-card glass">
                    <span className="eyebrow">{prescription.category}</span>
                    <h2>{prescription.name}</h2>
                    <p>{prescription.usage}</p>
                    <p className="muted">{prescription.indications}</p>
                    <div className="ingredients-list">
                      {prescription.ingredients.map((ingredient) => (
                        <span key={`${prescription.id}-${ingredient.name}`}>
                          {ingredient.name} <strong>{ingredient.dosage}</strong>
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Chưa có bài thuốc liên kết với vị này trong dữ liệu MVP.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="source-list">
            <article>
              <h2>Trích dẫn và ghi chú biên tập</h2>
              <p>
                Nội dung dùng cho tra cứu giáo dục. Các nguồn có URL được ưu tiên hiển thị để đội ngũ biên tập kiểm tra lại khi xuất bản.
              </p>
            </article>
            {herb.source_refs.map((source) => (
              <a
                key={`${source.label}-${source.url}`}
                href={source.url || '#'}
                target={source.url ? '_blank' : undefined}
                rel={source.url ? 'noreferrer' : undefined}
                className="source-item"
              >
                <span>{source.label}</span>
                <small>{source.url || 'Nguồn cổ phương nội bộ, cần biên tập viên xác thực trước khi xuất bản.'}</small>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default HerbDetail;
