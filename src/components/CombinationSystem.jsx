import React, { useMemo, useState } from 'react';
import { checkInteraction } from '../data/interactions';
import { getUseCaseShortLabel, safetyMeta } from '../data/taxonomy';

function CombinationSystem({ herbs = [] }) {
  const [selectedHerbs, setSelectedHerbs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleHerb = (herb) => {
    if (selectedHerbs.find((item) => item.id === herb.id)) {
      setSelectedHerbs(selectedHerbs.filter((item) => item.id !== herb.id));
      return;
    }

    if (selectedHerbs.length < 8) {
      setSelectedHerbs([...selectedHerbs, herb]);
    }
  };

  const interactions = useMemo(() => checkInteraction(selectedHerbs), [selectedHerbs]);
  const highRiskInteractions = interactions.filter((interaction) => interaction.severity === 'high');
  const selectedToxicHerbs = selectedHerbs.filter((herb) => herb.is_toxic);

  const analysis = useMemo(() => {
    const properties = [...new Set(selectedHerbs.map((herb) => herb.properties))];
    const meridians = [...new Set(selectedHerbs.flatMap((herb) => herb.meridians.split(',').map((item) => item.trim())))];
    const useCases = [...new Set(selectedHerbs.flatMap((herb) => herb.use_cases))];
    const tags = [...new Set(selectedHerbs.flatMap((herb) => herb.tags))];

    return {
      properties,
      meridians,
      useCases,
      tags,
      hasHeat: properties.some((property) => ['Ôn', 'Hơi ôn', 'Đại nhiệt'].includes(property)),
      hasCold: properties.some((property) => ['Hàn', 'Hơi hàn', 'Lương'].includes(property)),
    };
  }, [selectedHerbs]);

  const filteredHerbs = useMemo(
    () =>
      herbs.filter((herb) =>
        [herb.name_vn, herb.name_han, herb.scientific_name, herb.category, herb.usage_summary, ...herb.tags]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase()),
      ),
    [herbs, searchTerm],
  );

  const renderActionSummary = () => {
    if (selectedHerbs.length === 0) {
      return 'Chưa có vị thuốc nào được chọn.';
    }

    if (highRiskInteractions.length > 0 || selectedToxicHerbs.length > 0) {
      return 'Tổ hợp này cần dừng ở mức cảnh báo và chuyển cho thầy thuốc có chuyên môn đánh giá.';
    }

    const useCaseText = analysis.useCases.slice(0, 4).map(getUseCaseShortLabel).join(', ');
    return `Hướng tác dụng nổi bật: ${useCaseText || 'chưa đủ dữ liệu'}. Cần biện chứng hàn nhiệt, hư thực trước khi dùng.`;
  };

  return (
    <main className="combination-system container fade-in content-page">
      <header className="page-header centered">
        <span className="eyebrow">Formula Builder</span>
        <h1>Tạo Bài Thuốc Của Tôi</h1>
        <p>
          Chọn tối đa 8 vị thuốc để xem tương hợp, tương phản, hướng tác dụng tổng hợp và cảnh báo an toàn.
        </p>
      </header>

      <section className="formula-layout">
        <div className="selection-panel">
          <div className="panel-heading">
            <h2>Kho vị thuốc</h2>
            <span>{selectedHerbs.length}/8 vị</span>
          </div>
          <div className="search-box compact">
            <input
              type="text"
              placeholder="Tìm vị thuốc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span>⌕</span>
          </div>
          <div className="herb-picker">
            {filteredHerbs.map((herb) => {
              const isSelected = selectedHerbs.some((item) => item.id === herb.id);
              const safety = safetyMeta[herb.safety_level] || safetyMeta.normal;
              return (
                <button
                  key={herb.id}
                  className={`picker-item ${isSelected ? 'active' : ''} ${safety.tone}`}
                  onClick={() => toggleHerb(herb)}
                  type="button"
                >
                  <span>{herb.name_vn}</span>
                  <small>{`${herb.properties} • ${herb.meridians} (${herb.category})`}</small>
                </button>
              );
            })}
          </div>
        </div>

        <div className="analysis-panel glass">
          <div className="panel-heading">
            <h2>Phân tích phối ngũ</h2>
            <button onClick={() => setSelectedHerbs([])} disabled={selectedHerbs.length === 0} type="button">
              Xóa
            </button>
          </div>

          {selectedHerbs.length > 0 && (
            <div className="selected-chips">
              {selectedHerbs.map((herb) => (
                <button key={herb.id} onClick={() => toggleHerb(herb)} type="button">
                  {herb.name_vn} x
                </button>
              ))}
            </div>
          )}

          <div className={`formula-summary ${highRiskInteractions.length > 0 || selectedToxicHerbs.length > 0 ? 'danger' : ''}`}>
            <strong>{renderActionSummary()}</strong>
            {selectedHerbs.length > 1 && (
              <span>
                {analysis.hasHeat && analysis.hasCold
                  ? 'Tổ hợp có cả vị thiên ôn/nhiệt và hàn/lương, cần xem mục tiêu điều hòa hay xung khắc.'
                  : 'Tính vị đang tương đối một hướng, vẫn cần xét thể trạng và triệu chứng thực tế.'}
              </span>
            )}
          </div>

          {selectedToxicHerbs.length > 0 && (
            <div className="danger-callout">
              <strong>Có vị thuốc độc tính cao</strong>
              <p>{selectedToxicHerbs.map((herb) => herb.name_vn).join(', ')} không phù hợp tự dùng hoặc tự bào chế.</p>
            </div>
          )}

          <div className="interaction-results">
            {interactions.length > 0 ? (
              interactions.map((interaction) => (
                <article key={`${interaction.herbs.join('-')}-${interaction.type}`} className={`interaction-card ${interaction.severity}`}>
                  <div>
                    <strong>{interaction.herbs[0]} + {interaction.herbs[1]}</strong>
                    <span>{interaction.type}</span>
                  </div>
                  <p>{interaction.note}</p>
                </article>
              ))
            ) : (
              <div className="empty-state compact">
                <p>Chưa phát hiện tương kỵ trong dữ liệu hiện có.</p>
              </div>
            )}
          </div>

          {selectedHerbs.length > 0 && (
            <div className="advanced-snapshot">
              <div>
                <strong>Tính</strong>
                <span>{analysis.properties.join(', ') || 'Chưa có'}</span>
              </div>
              <div>
                <strong>Quy kinh</strong>
                <span>{analysis.meridians.slice(0, 8).join(', ') || 'Chưa có'}</span>
              </div>
              <div>
                <strong>Từ khóa</strong>
                <span>{analysis.tags.slice(0, 8).join(', ') || 'Chưa có'}</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default CombinationSystem;
