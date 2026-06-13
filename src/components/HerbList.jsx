import React, { useEffect, useMemo, useState } from 'react';
import { getUseCaseLabel, safetyMeta, safetyOptions, useCaseOptions } from '../data/taxonomy';

function HerbList({ herbs = [], initialUseCase = 'all', onSelectHerb }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProp, setFilterProp] = useState('all');
  const [filterUseCase, setFilterUseCase] = useState(initialUseCase);
  const [filterPart, setFilterPart] = useState('all');
  const [filterSafety, setFilterSafety] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    setFilterUseCase(initialUseCase || 'all');
    setVisibleCount(24);
  }, [initialUseCase]);

  useEffect(() => {
    setVisibleCount(24);
  }, [searchTerm, filterProp, filterUseCase, filterPart, filterSafety]);

  const properties = useMemo(() => ['all', ...new Set(herbs.map((herb) => herb.properties))], [herbs]);
  const parts = useMemo(() => ['all', ...new Set(herbs.map((herb) => herb.part_used))], [herbs]);

  const filteredHerbs = useMemo(() => herbs.filter((herb) => {
    const searchPool = [
      herb.name_vn,
      herb.name_han,
      herb.scientific_name,
      herb.category,
      herb.part_used,
      herb.properties,
      herb.taste,
      herb.meridians,
      herb.usage_summary,
      herb.basic_summary,
      ...herb.tags,
    ]
      .join(' ')
      .toLowerCase();

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchesSearch = !normalizedSearch || searchPool.includes(normalizedSearch);
    const matchesFilter = filterProp === 'all' || herb.properties === filterProp;
    const matchesUseCase = filterUseCase === 'all' || herb.use_cases.includes(filterUseCase);
    const matchesPart = filterPart === 'all' || herb.part_used === filterPart;
    const matchesSafety = filterSafety === 'all' || herb.safety_level === filterSafety;

    return matchesSearch && matchesFilter && matchesUseCase && matchesPart && matchesSafety;
  }), [filterPart, filterProp, filterSafety, filterUseCase, herbs, searchTerm]);

  const displayedHerbs = useMemo(() => {
    return filteredHerbs.slice(0, visibleCount);
  }, [filteredHerbs, visibleCount]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterProp('all');
    setFilterUseCase('all');
    setFilterPart('all');
    setFilterSafety('all');
  };

  const renderSafetyBadge = (herb) => {
    const meta = safetyMeta[herb.safety_level] || safetyMeta.normal;
    return <span className={`safety-badge ${meta.tone}`}>{meta.label}</span>;
  };

  return (
    <main className="herb-list-page container fade-in content-page">
      <header className="page-header">
        <span className="eyebrow">Materia Medica</span>
        <h1>Thư Viện Thảo Dược</h1>
        <p>
          Hệ thống tra cứu thông tin dược lý thảo dược Đông y, cung cấp đầy đủ tính vị, quy kinh, công dụng, cách dùng và cảnh báo an toàn.
        </p>
      </header>

      <section className="controls glass" aria-label="Bộ lọc thảo dược">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm tên, công dụng, tính vị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span>⌕</span>
        </div>

        <label>
          Công dụng
          <select value={filterUseCase} onChange={(e) => setFilterUseCase(e.target.value)}>
            {useCaseOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Tính
          <select value={filterProp} onChange={(e) => setFilterProp(e.target.value)}>
            {properties.map((property) => (
              <option key={property} value={property}>
                {property === 'all' ? 'Tất cả tính vị' : property}
              </option>
            ))}
          </select>
        </label>

        <label>
          Bộ phận
          <select value={filterPart} onChange={(e) => setFilterPart(e.target.value)}>
            {parts.map((part) => (
              <option key={part} value={part}>
                {part === 'all' ? 'Tất cả bộ phận' : part}
              </option>
            ))}
          </select>
        </label>

        <label>
          Cảnh báo
          <select value={filterSafety} onChange={(e) => setFilterSafety(e.target.value)}>
            {safetyOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="view-toggle" aria-label="Kiểu hiển thị">
          <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} type="button">
            ⚃
          </button>
          <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} type="button">
            ☰
          </button>
        </div>
      </section>

      <div className="result-meta">
        <span>{filteredHerbs.length} hồ sơ phù hợp</span>
        {filterUseCase !== 'all' && <span>Nhóm: {getUseCaseLabel(filterUseCase)}</span>}
      </div>

      <section className={viewMode === 'grid' ? 'herb-grid' : 'herb-list-view'}>
        {displayedHerbs.map((herb) => (
          <button
            key={herb.id}
            className={viewMode === 'grid' ? 'herb-card' : 'herb-list-item'}
            onClick={() => onSelectHerb(herb)}
            type="button"
          >
            <span className={`risk-ribbon ${herb.safety_level}`}>{herb.is_toxic ? 'Có độc' : herb.category}</span>
            <span className="herb-image" style={{ backgroundImage: `url(${herb.image})` }} />
            <span className="herb-info">
              <span className="herb-topline">
                <span className="herb-han">{herb.name_han}</span>
                {renderSafetyBadge(herb)}
              </span>
              <span className="herb-name">{herb.name_vn}</span>
              <span className="herb-latin">{herb.scientific_name}</span>
              <span className="herb-summary">{herb.basic_summary}</span>
              <span className="herb-props">
                <span className="prop-tag">{herb.properties}</span>
                <span className="prop-tag accent">{herb.taste}</span>
                <span className="prop-tag">{herb.meridians}</span>
              </span>
              <span className="mini-facts">
                <span>Bộ phận: {herb.part_used}</span>
                <span>Nhóm: {herb.category}</span>
              </span>
            </span>
          </button>
        ))}
      </section>

      {filteredHerbs.length > visibleCount && (
        <div className="load-more-container">
          <button
            className="load-more-btn"
            onClick={() => setVisibleCount((prev) => prev + 24)}
            type="button"
          >
            Xem thêm (còn {filteredHerbs.length - visibleCount} vị)
          </button>
        </div>
      )}

      {filteredHerbs.length === 0 && (
        <div className="empty-state">
          <p>Không tìm thấy hồ sơ phù hợp.</p>
          <button onClick={resetFilters} type="button">
            Xóa bộ lọc
          </button>
        </div>
      )}
    </main>
  );
}

export default HerbList;
