import React, { useMemo, useState } from 'react';
import { prescriptions } from '../data/prescriptions';

function PrescriptionLibrary({ herbs = [], onSelectHerb }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'classical', 'nam_duoc', 'y_tong_tam_linh'
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  // Filter based on selected tab
  const tabPrescriptions = useMemo(() => {
    return prescriptions.filter((p) => {
      if (activeTab === 'classical') {
        return p.category !== 'Nam Dược Thần Hiệu' && p.category !== 'Y Tông Tâm Lĩnh';
      }
      if (activeTab === 'nam_duoc') {
        return p.category === 'Nam Dược Thần Hiệu';
      }
      if (activeTab === 'y_tong_tam_linh') {
        return p.category === 'Y Tông Tâm Lĩnh';
      }
      return true; // 'all'
    });
  }, [activeTab]);

  // Sub-categories for the active tab
  const categories = useMemo(() => {
    if (activeTab === 'nam_duoc' || activeTab === 'y_tong_tam_linh') {
      return ['all'];
    }
    const list = tabPrescriptions.map((p) => p.category);
    return ['all', ...new Set(list)];
  }, [tabPrescriptions, activeTab]);

  // Filter based on search term and category
  const filteredPrescriptions = tabPrescriptions.filter((prescription) => {
    const searchPool = [
      prescription.name,
      prescription.source,
      prescription.category,
      prescription.usage,
      prescription.indications,
      prescription.caution,
      ...prescription.ingredients.map((ingredient) => ingredient.name),
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch = !searchTerm.trim() || searchPool.includes(searchTerm.trim().toLowerCase());
    const matchesCategory = category === 'all' || prescription.category === category;
    return matchesSearch && matchesCategory;
  });

  const herbByName = useMemo(
    () => new Map(herbs.map((herb) => [herb.name_vn, herb])),
    [herbs],
  );

  const findHerb = (name) => herbByName.get(name);

  // Dynamic symptom suggestions based on active tab
  const symptomSuggestions = useMemo(() => {
    if (activeTab === 'nam_duoc') {
      return ['Cảm mạo', 'Ho', 'Tiêu chảy', 'Mụn nhọt', 'Đau khớp', 'Tiểu đường'];
    }
    if (activeTab === 'y_tong_tam_linh') {
      return ['Đột quỵ', 'Đau ngực', 'Mê sảng', 'Hư hàn', 'Khai khiếu'];
    }
    return ['Mất ngủ', 'Chóng mặt', 'Mệt mỏi', 'Sốt', 'Ăn kém', 'Ho đờm'];
  }, [activeTab]);

  return (
    <main className="prescription-library container fade-in content-page">
      <header className="page-header">
        <span className="eyebrow">Formulas & Recipes</span>
        <h1>Thư Viện Bài Thuốc</h1>
        <p>
          Tìm kiếm và tra cứu các bài thuốc cổ phương kinh điển, Nam dược dân gian và các biến phương gia giảm lâm sàng.
        </p>
      </header>

      {/* Modern Tabs */}
      <div className="library-tabs glass">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => { setActiveTab('all'); setCategory('all'); setSearchTerm(''); setExpandedId(null); }}
          type="button"
        >
          <span>✦ Tất cả bài thuốc</span>
          <span className="count-badge">
            {prescriptions.length}
          </span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'classical' ? 'active' : ''}`}
          onClick={() => { setActiveTab('classical'); setCategory('all'); setSearchTerm(''); setExpandedId(null); }}
          type="button"
        >
          <span>🌿 Cổ phương kinh điển</span>
          <span className="count-badge">
            {prescriptions.filter(p => p.category !== 'Nam Dược Thần Hiệu' && p.category !== 'Y Tông Tâm Lĩnh').length}
          </span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'nam_duoc' ? 'active' : ''}`}
          onClick={() => { setActiveTab('nam_duoc'); setCategory('all'); setSearchTerm(''); setExpandedId(null); }}
          type="button"
        >
          <span>🍃 Nam Dược Thần Hiệu</span>
          <span className="count-badge">
            {prescriptions.filter(p => p.category === 'Nam Dược Thần Hiệu').length}
          </span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'y_tong_tam_linh' ? 'active' : ''}`}
          onClick={() => { setActiveTab('y_tong_tam_linh'); setCategory('all'); setSearchTerm(''); setExpandedId(null); }}
          type="button"
        >
          <span>📜 Y Tông Tâm Lĩnh</span>
          <span className="count-badge">
            {prescriptions.filter(p => p.category === 'Y Tông Tâm Lĩnh').length}
          </span>
        </button>
      </div>

      <section className="controls glass prescription-controls" aria-label="Bộ lọc bài thuốc">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm bài thuốc, triệu chứng, vị thuốc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span>⌕</span>
        </div>
        
        <div className="symptom-tags" style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginRight: '8px', alignSelf: 'center' }}>Gợi ý triệu chứng:</span>
          {symptomSuggestions.map(symp => (
            <button 
              key={symp} 
              className="prop-tag" 
              style={{ cursor: 'pointer', background: searchTerm.toLowerCase() === symp.toLowerCase() ? 'var(--primary-color)' : '', color: searchTerm.toLowerCase() === symp.toLowerCase() ? '#fff' : '' }}
              onClick={() => setSearchTerm(searchTerm.toLowerCase() === symp.toLowerCase() ? '' : symp)}
              type="button"
            >
              {symp}
            </button>
          ))}
        </div>

        {categories.length > 1 && (
          <label style={{ marginTop: '16px', display: 'block' }}>
            Nhóm bài
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === 'all' ? 'Tất cả nhóm bài' : item}
                </option>
              ))}
            </select>
          </label>
        )}
      </section>

      <section className="prescription-grid">
        {filteredPrescriptions.map((prescription) => (
          <article key={prescription.id} className="prescription-card glass">
            <span className="eyebrow">{prescription.source}</span>
            <h2>{prescription.name}</h2>
            <span className="prop-tag accent">{prescription.category}</span>

            <div className="formula-block">
              <strong>Công dụng</strong>
              <p>{prescription.usage}</p>
            </div>

            <div className="formula-block">
              <strong>Chỉ định tham khảo</strong>
              <p>{prescription.indications}</p>
            </div>

            <div className="formula-block">
              <strong>Cách dùng & bào chế</strong>
              <p>{prescription.preparation}</p>
            </div>

            {prescription.ingredients && prescription.ingredients.length > 0 ? (
              <div className="ingredients-list detailed">
                <strong>Thành phần & liều lượng</strong>
                <div>
                  {prescription.ingredients.map((ingredient) => {
                    const herb = findHerb(ingredient.name);
                    const roleClass = `role-${ingredient.role?.toLowerCase() || 'default'}`;
                    return (
                      <button
                        key={`${prescription.id}-${ingredient.name}`}
                        className={`ingredient-chip ${herb ? 'linked' : ''} ${roleClass}`}
                        onClick={() => herb && onSelectHerb?.(herb)}
                        disabled={!herb}
                        type="button"
                      >
                        <span className="herb-name">{ingredient.name}</span>
                        <span className="herb-details">
                          <span className="role-badge">{ingredient.role}</span>
                          <span className="dosage-badge">{ingredient.dosage}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="ingredients-list detailed" style={{ background: 'rgba(230, 240, 230, 0.3)' }}>
                <strong>Thành phần & phối ngũ</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic', marginTop: '4px' }}>
                  Bài thuốc mang tính chất định hướng lâm sàng hoặc biến phương gia giảm linh hoạt theo chứng trạng. Hãy tham khảo ý kiến thầy thuốc.
                </p>
              </div>
            )}

            <div className="alert-panel caution">
              <strong>Cảnh báo an toàn</strong>
              <p>{prescription.caution}</p>
            </div>

            <div className="card-footer" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px' }}>
              <button
                className={`tab-btn ${expandedId === prescription.id ? 'active' : ''}`}
                onClick={() => toggleExpand(prescription.id)}
                type="button"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.25s ease'
                }}
              >
                <span>{expandedId === prescription.id ? 'Thu gọn chi tiết' : 'Xem chi tiết bài thuốc'}</span>
                <span>{expandedId === prescription.id ? '▲' : '▼'}</span>
              </button>
            </div>

            {expandedId === prescription.id && (
              <div className="prescription-details-panel">
                <div className="detail-section">
                  <strong className="detail-title">
                    🌿 Phối ngũ & Cơ chế tác dụng
                  </strong>
                  <p className="detail-desc">
                    {prescription.explanation}
                  </p>
                </div>

                <div className="detail-section">
                  <strong className="detail-title">
                    🧪 Bào chế & Cách sắc
                  </strong>
                  <p className="detail-desc">
                    {prescription.processing}
                  </p>
                </div>

                <div className="detail-section">
                  <strong className="detail-title">
                    🩺 Gia giảm & Lưu ý lâm sàng
                  </strong>
                  <p className="detail-desc" style={{ whiteSpace: 'pre-line' }}>
                    {prescription.clinical_notes}
                  </p>
                </div>
              </div>
            )}
          </article>
        ))}
      </section>

      {filteredPrescriptions.length === 0 && (
        <div className="empty-state">
          <p>Không tìm thấy bài thuốc phù hợp.</p>
        </div>
      )}
    </main>
  );
}

export default PrescriptionLibrary;
