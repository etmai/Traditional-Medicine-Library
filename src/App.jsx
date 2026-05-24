import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import HerbList from './components/HerbList';
import HerbDetail from './components/HerbDetail';
import CombinationSystem from './components/CombinationSystem';
import PrescriptionLibrary from './components/PrescriptionLibrary';
import BookLibrary from './components/BookLibrary';
import AdminDashboard from './components/AdminDashboard';
import { getUseCaseShortLabel, useCaseOptions } from './data/taxonomy';

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedHerb, setSelectedHerb] = useState(null);
  const [selectedUseCase, setSelectedUseCase] = useState('all');
  const [targetChapter, setTargetChapter] = useState(null);
  const [herbs, setHerbs] = useState([]);
  const [isHerbDataLoading, setIsHerbDataLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;

    import('./data/herbs').then((module) => {
      if (isMounted) {
        setHerbs(module.herbs);
        setIsHerbDataLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredHerbs = useMemo(
    () => herbs.filter((herb) => ['nhan-sam', 'duong-quy', 'cam-thao', 'phu-tu'].includes(herb.slug)),
    [herbs],
  );

  const homeCategories = useMemo(
    () =>
      ['tonic', 'cold', 'tea', 'digestion', 'detox', 'joint'].map((id) => ({
        id,
        name: getUseCaseShortLabel(id),
        count: herbs.filter((herb) => herb.use_cases.includes(id)).length,
        icon: {
          tonic: '🍵',
          cold: '💨',
          tea: '🍃',
          digestion: '🍂',
          detox: '🧪',
          joint: '🦴',
        }[id],
      })),
    [herbs],
  );

  const handleSelectHerb = (herb) => {
    setSelectedHerb(herb);
    setCurrentPage('detail');
    window.scrollTo(0, 0);
  };

  const renderDataLoading = () => (
    <main className="content-page container fade-in">
      <div className="empty-state">
        <p>Đang tải kho dữ liệu thảo dược...</p>
      </div>
    </main>
  );

  const openHerbLibrary = (useCaseId = 'all') => {
    setSelectedUseCase(useCaseId);
    setCurrentPage('herbs');
    window.scrollTo(0, 0);
  };

  const navigateToBook = (chapterId) => {
    setTargetChapter(chapterId);
    setCurrentPage('book');
  };

  const renderHome = () => (
    <>
      <section className="hero" style={{ backgroundImage: 'url(/images/hero-banner.png)' }}>
        <div className="hero-content fade-in">
          <span className="hero-kicker">Thư viện thảo dược & Cổ phương lý luận</span>
          <h1 className="hero-title">Bách Thảo Kính</h1>
          <p className="hero-subtitle">
            Tra cứu hồ sơ vị thuốc, tính vị quy kinh, cách bào chế, phối ngũ vị thuốc và lý luận Đông y chọn lọc tinh tuyển trong một trải nghiệm rõ ràng.
          </p>
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Tìm thảo dược, công dụng, bài thuốc..."
              onFocus={() => openHerbLibrary('all')}
            />
            <span className="search-icon">⌕</span>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <h2 className="section-title">Danh Mục Phổ Biến</h2>
          <p>Đi từ nhu cầu thường gặp, sau đó mở hồ sơ chi tiết khi cần tra cứu sâu hơn.</p>
        </div>
        <div className="category-grid">
          {homeCategories.map((cat) => (
            <button key={cat.id} className="category-card" onClick={() => openHerbLibrary(cat.id)} type="button">
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name}</span>
              <span className="category-count">{cat.count} vị thuốc</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section container feature-band">
        <div className="section-heading">
          <h2 className="section-title">Hồ Sơ Nổi Bật</h2>
          <p>Các vị thuốc tiêu biểu, gồm cả vị cần cảnh báo nổi bật để người dùng nhận diện rủi ro sớm.</p>
        </div>
        <div className="herb-grid">
          {featuredHerbs.map((herb) => (
            <button key={herb.id} className="herb-card" onClick={() => handleSelectHerb(herb)} type="button">
              <span className={`risk-ribbon ${herb.safety_level}`}>{herb.is_toxic ? 'Có độc' : herb.category}</span>
              <span className="herb-image" style={{ backgroundImage: `url(${herb.image})` }} />
              <span className="herb-info">
                <span className="herb-han">{herb.name_han}</span>
                <span className="herb-name">{herb.name_vn}</span>
                <span className="herb-summary">{herb.basic_summary}</span>
                <span className="herb-props">
                  <span className="prop-tag">{herb.properties}</span>
                  <span className="prop-tag accent">{herb.part_used}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
        <div className="center-action">
          <button className="primary-action" onClick={() => openHerbLibrary('all')} type="button">
            Xem thư viện thảo dược
          </button>
        </div>
      </section>

      <section className="container trust-strip" aria-label="Cam kết an toàn nội dung">
        <div>
          <strong>Cảnh báo y tế</strong>
          <span>Thông tin chỉ để tham khảo, không thay thế chẩn đoán hoặc điều trị y tế.</span>
        </div>
        <div>
          <strong>Nguồn minh bạch</strong>
          <span>Hồ sơ có vùng nguồn tham khảo tuyển chọn và ghi chú mức độ thận trọng.</span>
        </div>
        <div>
          <strong>Biên tập dược</strong>
          <span>Schema đã chuẩn bị cho CMS và quy trình duyệt nội dung lý luận cổ y.</span>
        </div>
      </section>
    </>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return renderHome();
      case 'herbs':
        if (isHerbDataLoading) return renderDataLoading();
        return (
          <HerbList
            herbs={herbs}
            initialUseCase={selectedUseCase}
            onSelectHerb={handleSelectHerb}
          />
        );
      case 'detail':
        return <HerbDetail herb={selectedHerb} onBack={() => openHerbLibrary(selectedUseCase)} onNavigateToBook={navigateToBook} />;
      case 'combination':
        if (isHerbDataLoading) return renderDataLoading();
        return <CombinationSystem herbs={herbs} />;
      case 'prescription':
        if (isHerbDataLoading) return renderDataLoading();
        return <PrescriptionLibrary herbs={herbs} onSelectHerb={handleSelectHerb} />;
      case 'book':
        return <BookLibrary initialChapter={targetChapter} />;
      case 'admin':
        if (isHerbDataLoading) return renderDataLoading();
        return <AdminDashboard herbs={herbs} />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <nav className={`navbar ${isScrolled || currentPage !== 'home' ? 'scrolled' : ''}`}>
        <button className="logo" onClick={() => setCurrentPage('home')} type="button" style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
            <circle cx="12" cy="12" r="10" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 2" />
            <path d="M12 6C15 6 17 9 17 12C17 15 15 17 12 18C9 17 7 15 7 12C7 9 9 6 12 6Z" fill="var(--primary-color)" fillOpacity="0.15" stroke="var(--primary-color)" strokeWidth="1.5" />
            <path d="M12 6V18" stroke="var(--primary-color)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 10C13 10.5 14 11 15 11" stroke="var(--primary-color)" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M12 13C13 13.5 14 14 15 14" stroke="var(--primary-color)" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M12 12C11 12.5 10 13 9 13" stroke="var(--primary-color)" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M12 15C11 15.5 10 16 9 16" stroke="var(--primary-color)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Bách Thảo Kính
        </button>
        <ul className="nav-links">
          <li>
            <a
              href="#"
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage('home');
              }}
            >
              Trang chủ
            </a>
          </li>
          <li>
            <a
              href="#"
              className={`nav-link ${currentPage === 'herbs' || currentPage === 'detail' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                openHerbLibrary('all');
              }}
            >
              Tra cứu
            </a>
          </li>
          <li>
            <a
              href="#"
              className={`nav-link ${currentPage === 'combination' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage('combination');
              }}
            >
              Phối ngũ
            </a>
          </li>
          <li>
            <a
              href="#"
              className={`nav-link ${currentPage === 'prescription' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage('prescription');
              }}
            >
              Bài thuốc
            </a>
          </li>
          <li>
            <a
              href="#"
              className={`nav-link ${currentPage === 'book' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage('book');
              }}
            >
              Thư Viện Kiến Thức
            </a>
          </li>
          <li>
            <a
              href="#"
              className={`nav-link ${currentPage === 'admin' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage('admin');
              }}
            >
              Admin
            </a>
          </li>
        </ul>
      </nav>

      {renderContent()}

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h3>Bách Thảo Kính</h3>
              <p>Nền tảng tri thức Đông y hiện đại, ưu tiên cấu trúc dữ liệu rõ ràng, lý luận cổ y học tuyển lọc và cảnh báo an toàn.</p>
            </div>
            <div>
              <h4>Phân nhóm</h4>
              <ul>
                {useCaseOptions.slice(1, 5).map((option) => (
                  <li key={option.id}>{option.shortLabel}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Nguồn tham khảo lý luận</h4>
              <p>Hồ sơ sử dụng nguồn cổ phương tuyển chọn, tài liệu dược liệu của GS Đỗ Tất Lợi và Hải Thượng Y Tông Tâm Lĩnh.</p>
            </div>
          </div>
          <div className="footer-disclaimer">
            <p>
              MIỄN TRỪ TRÁCH NHIỆM: Thông tin trên web app chỉ mang tính tham khảo, không thay thế chẩn đoán
              và điều trị y tế. Vui lòng tham khảo ý kiến bác sĩ hoặc thầy thuốc có chuyên môn trước khi sử dụng
              bất kỳ vị thuốc nào.
            </p>
            <p>© 2026 Bách Thảo Kính. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {isScrolled && (
        <button
          className="scroll-to-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Cuộn lên đầu trang"
          type="button"
        >
          ↑
        </button>
      )}
    </div>
  );
}

export default App;
