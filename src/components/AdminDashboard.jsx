import React, { useMemo, useState } from 'react';
import { interactions as seedInteractions } from '../data/interactions';
const seedSources = [];
import { prescriptions as seedPrescriptions } from '../data/prescriptions';
import { getUseCaseShortLabel, safetyMeta } from '../data/taxonomy';

const adminTabs = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'posts', label: 'Bài viết' },
  { id: 'herbs', label: 'Thảo dược' },
  { id: 'formulas', label: 'Bài thuốc' },
  { id: 'pairing', label: 'Phối ngũ' },
  { id: 'sources', label: 'Nguồn & OCR' },
  { id: 'review', label: 'Duyệt nội dung' },
  { id: 'audit', label: 'Nhật ký' },
  { id: 'settings', label: 'Cấu hình' },
];

const emptyPost = {
  title: '',
  category: 'Dưỡng sinh',
  status: 'draft',
  excerpt: '',
  body: '',
  source: '',
};

const storageKeys = {
  posts: 'celestial-admin-posts',
  herbs: 'celestial-admin-herbs',
  prescriptions: 'celestial-admin-prescriptions',
  interactions: 'celestial-admin-interactions',
  sources: 'celestial-admin-sources',
  audit: 'celestial-admin-audit',
};

const statusLabel = {
  normal: 'Ổn định',
  caution: 'Thận trọng',
  toxic: 'Cảnh báo đỏ',
};

const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(value);
const readStorage = (key, fallback) => {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const sourceNeedsReview = (source) => source.extractionStatus === 'scan-needs-ocr';
const herbNeedsReview = (herb) =>
  herb.safety_level === 'toxic' ||
  herb.source_refs?.some((source) => /cần OCR|PDF -|scan/i.test(source.label));

const makeSlug = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function AdminDashboard({ herbs = [] }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [session, setSession] = useState(() => {
    const saved = window.localStorage.getItem('celestial-admin-session');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginForm, setLoginForm] = useState({ email: 'admin@celestial.local', password: '' });
  const [query, setQuery] = useState('');
  const [safetyFilter, setSafetyFilter] = useState('all');
  const [managedHerbs, setManagedHerbs] = useState(() => readStorage(storageKeys.herbs, herbs));
  const [managedPosts, setManagedPosts] = useState(() => readStorage(storageKeys.posts, [
    {
      id: 1,
      title: 'Cách đọc hồ sơ vị thuốc an toàn',
      category: 'Hướng dẫn',
      status: 'published',
      excerpt: 'Mẫu bài viết giới thiệu cách đọc tính vị, quy kinh, liều dùng và cảnh báo.',
      body: 'Nội dung cần được biên tập và gắn nguồn trước khi xuất bản.',
      source: 'Biên tập nội bộ',
      updatedAt: '2026-05-16',
    },
  ]));
  const [managedPrescriptions, setManagedPrescriptions] = useState(() => readStorage(storageKeys.prescriptions, seedPrescriptions));
  const [managedInteractions, setManagedInteractions] = useState(() => readStorage(storageKeys.interactions, seedInteractions));
  const [managedSources, setManagedSources] = useState(() => readStorage(storageKeys.sources, seedSources));
  const [auditLog, setAuditLog] = useState(() => readStorage(storageKeys.audit, []));
  const [editingHerb, setEditingHerb] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editingFormula, setEditingFormula] = useState(null);
  const [editingInteraction, setEditingInteraction] = useState(null);
  const [editingSource, setEditingSource] = useState(null);
  const [notice, setNotice] = useState('');

  React.useEffect(() => {
    if (!window.localStorage.getItem(storageKeys.herbs)) {
      setManagedHerbs(herbs);
    }
  }, [herbs]);

  React.useEffect(() => {
    window.localStorage.setItem(storageKeys.posts, JSON.stringify(managedPosts));
  }, [managedPosts]);

  React.useEffect(() => {
    window.localStorage.setItem(storageKeys.herbs, JSON.stringify(managedHerbs));
  }, [managedHerbs]);

  React.useEffect(() => {
    window.localStorage.setItem(storageKeys.prescriptions, JSON.stringify(managedPrescriptions));
  }, [managedPrescriptions]);

  React.useEffect(() => {
    window.localStorage.setItem(storageKeys.interactions, JSON.stringify(managedInteractions));
  }, [managedInteractions]);

  React.useEffect(() => {
    window.localStorage.setItem(storageKeys.sources, JSON.stringify(managedSources));
  }, [managedSources]);

  React.useEffect(() => {
    window.localStorage.setItem(storageKeys.audit, JSON.stringify(auditLog.slice(0, 100)));
  }, [auditLog]);

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2200);
  };

  const addAudit = (action, target) => {
    setAuditLog((items) => [
      {
        id: Date.now(),
        action,
        target,
        actor: session?.email || 'admin',
        at: new Date().toLocaleString('vi-VN'),
      },
      ...items,
    ].slice(0, 100));
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const nextSession = {
      name: 'Quản trị viên',
      email: loginForm.email,
      role: 'Admin nội dung',
      signedAt: new Date().toISOString(),
    };
    window.localStorage.setItem('celestial-admin-session', JSON.stringify(nextSession));
    setSession(nextSession);
  };

  const handleLogout = () => {
    window.localStorage.removeItem('celestial-admin-session');
    setSession(null);
  };

  const metrics = useMemo(() => {
    const toxicHerbs = managedHerbs.filter((herb) => herb.safety_level === 'toxic');
    const cautionHerbs = managedHerbs.filter((herb) => herb.safety_level === 'caution');
    const riskyInteractions = managedInteractions.filter(
      (item) => item.severity === 'high' || item.type?.toLowerCase().includes('tương phản'),
    );
    const pendingSources = managedSources.filter(sourceNeedsReview);
    const pendingPages = pendingSources.reduce((total, source) => total + (source.pages || 0), 0);

    return {
      totalHerbs: managedHerbs.length,
      toxicHerbs: toxicHerbs.length,
      cautionHerbs: cautionHerbs.length,
      posts: managedPosts.length,
      prescriptions: managedPrescriptions.length,
      interactions: managedInteractions.length,
      riskyInteractions: riskyInteractions.length,
      sources: managedSources.length,
      pendingSources: pendingSources.length,
      pendingPages,
    };
  }, [managedHerbs, managedInteractions, managedPosts, managedPrescriptions, managedSources]);

  const filteredHerbs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return managedHerbs
      .filter((herb) => {
        const matchesSafety = safetyFilter === 'all' || herb.safety_level === safetyFilter;
        const matchesQuery =
          !normalizedQuery ||
          [herb.name_vn, herb.name_han, herb.scientific_name, herb.category, herb.part_used]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedQuery));

        return matchesSafety && matchesQuery;
      })
      .slice(0, 80);
  }, [managedHerbs, query, safetyFilter]);

  const reviewQueue = useMemo(() => {
    const herbItems = managedHerbs.filter(herbNeedsReview).slice(0, 24).map((herb) => ({
      id: `herb-${herb.id}`,
      type: 'Hồ sơ thảo dược',
      title: herb.name_vn,
      priority: herb.safety_level === 'toxic' ? 'Cao' : 'Vừa',
      note:
        herb.safety_level === 'toxic'
          ? 'Cần kiểm chứng độc tính, liều lượng, bào chế và cảnh báo hiển thị.'
          : 'Cần đối chiếu nguồn PDF/OCR và chuẩn hóa trích dẫn.',
    }));

    const pairingItems = managedInteractions
      .filter((item) => item.severity === 'high')
      .slice(0, 10)
      .map((item, index) => ({
        id: `pair-${index}`,
        type: 'Luật phối ngũ',
        title: `${item.herb1} + ${item.herb2}`,
        priority: 'Cao',
        note: item.note,
      }));

    const sourceItems = managedSources.filter(sourceNeedsReview).map((source) => ({
      id: `source-${source.id}`,
      type: 'Nguồn PDF',
      title: source.title,
      priority: 'Vừa',
      note: `${formatNumber(source.pages)} trang cần OCR, tách đoạn và gắn citation.`,
    }));

    return [...sourceItems, ...pairingItems, ...herbItems];
  }, [managedHerbs, managedInteractions, managedSources]);

  const savePost = (event) => {
    event.preventDefault();
    const id = editingPost.id || Date.now();
    const nextPost = {
      ...editingPost,
      id,
      slug: editingPost.slug || makeSlug(editingPost.title || `bai-viet-${id}`),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setManagedPosts((items) => {
      const exists = items.some((item) => item.id === id);
      return exists ? items.map((item) => (item.id === id ? nextPost : item)) : [nextPost, ...items];
    });
    setEditingPost(null);
    addAudit(editingPost.id ? 'Cập nhật bài viết' : 'Tạo bài viết', nextPost.title);
    showNotice('Đã lưu bài viết trong phiên quản trị hiện tại.');
  };

  const saveHerb = (event) => {
    event.preventDefault();
    const id = editingHerb.id || Date.now();
    const nextHerb = {
      ...editingHerb,
      id,
      slug: editingHerb.slug || makeSlug(editingHerb.name_vn || `vi-thuoc-${id}`),
      is_toxic: editingHerb.safety_level === 'toxic',
      tags: String(editingHerb.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
      use_cases: String(editingHerb.use_cases || '').split(',').map((tag) => tag.trim()).filter(Boolean),
      source_refs: [{ label: editingHerb.source_label || 'Nguồn biên tập nội bộ', url: '' }],
    };

    setManagedHerbs((items) => {
      const exists = items.some((item) => item.id === id);
      return exists ? items.map((item) => (item.id === id ? nextHerb : item)) : [nextHerb, ...items];
    });
    setEditingHerb(null);
    addAudit(editingHerb.id ? 'Cập nhật vị thuốc' : 'Tạo vị thuốc', nextHerb.name_vn);
    showNotice('Đã lưu hồ sơ thảo dược.');
  };

  const saveFormula = (event) => {
    event.preventDefault();
    const id = editingFormula.id || Date.now();
    const nextFormula = {
      ...editingFormula,
      id,
      ingredients: String(editingFormula.ingredientsText || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [name, dosage = '', role = ''] = line.split('|').map((item) => item.trim());
          return { name, dosage, role };
        }),
    };

    setManagedPrescriptions((items) => {
      const exists = items.some((item) => item.id === id);
      return exists ? items.map((item) => (item.id === id ? nextFormula : item)) : [nextFormula, ...items];
    });
    setEditingFormula(null);
    addAudit(editingFormula.id ? 'Cập nhật bài thuốc' : 'Tạo bài thuốc', nextFormula.name);
    showNotice('Đã lưu bài thuốc.');
  };

  const saveInteraction = (event) => {
    event.preventDefault();
    const id = editingInteraction.id || Date.now();
    const nextInteraction = { ...editingInteraction, id };
    setManagedInteractions((items) => {
      const exists = items.some((item) => item.id === id);
      return exists ? items.map((item) => (item.id === id ? nextInteraction : item)) : [nextInteraction, ...items];
    });
    setEditingInteraction(null);
    addAudit(editingInteraction.id ? 'Cập nhật phối ngũ' : 'Tạo phối ngũ', `${nextInteraction.herb1} + ${nextInteraction.herb2}`);
    showNotice('Đã lưu luật phối ngũ.');
  };

  const saveSource = (event) => {
    event.preventDefault();
    const id = editingSource.id || makeSlug(editingSource.title || `nguon-${Date.now()}`);
    const nextSource = { ...editingSource, id, pages: Number(editingSource.pages || 0) };
    setManagedSources((items) => {
      const exists = items.some((item) => item.id === id);
      return exists ? items.map((item) => (item.id === id ? nextSource : item)) : [nextSource, ...items];
    });
    setEditingSource(null);
    addAudit(editingSource.id ? 'Cập nhật nguồn' : 'Tạo nguồn', nextSource.title);
    showNotice('Đã lưu nguồn tư liệu.');
  };

  const exportBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      posts: managedPosts,
      herbs: managedHerbs,
      prescriptions: managedPrescriptions,
      interactions: managedInteractions,
      sources: managedSources,
      auditLog,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `celestial-ring-admin-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addAudit('Xuất backup', 'Toàn bộ dữ liệu quản trị');
  };

  const importBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const payload = JSON.parse(text);
    if (Array.isArray(payload.posts)) setManagedPosts(payload.posts);
    if (Array.isArray(payload.herbs)) setManagedHerbs(payload.herbs);
    if (Array.isArray(payload.prescriptions)) setManagedPrescriptions(payload.prescriptions);
    if (Array.isArray(payload.interactions)) setManagedInteractions(payload.interactions);
    if (Array.isArray(payload.sources)) setManagedSources(payload.sources);
    if (Array.isArray(payload.auditLog)) setAuditLog(payload.auditLog);
    addAudit('Nhập backup', file.name);
    showNotice('Đã nhập dữ liệu backup.');
    event.target.value = '';
  };

  const resetLocalData = () => {
    Object.values(storageKeys).forEach((key) => window.localStorage.removeItem(key));
    setManagedPosts([]);
    setManagedHerbs(herbs);
    setManagedPrescriptions(seedPrescriptions);
    setManagedInteractions(seedInteractions);
    setManagedSources(seedSources);
    setAuditLog([]);
    showNotice('Đã khôi phục dữ liệu seed và xóa dữ liệu quản trị cục bộ.');
  };

  const renderLogin = () => (
    <main className="admin-page">
      <section className="admin-login container">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <span className="eyebrow">Admin secure area</span>
          <h1>Đăng nhập quản trị</h1>
          <p>
            Đây là lớp đăng nhập prototype cho frontend. Khi nối backend, form này cần gọi API xác thực,
            phân quyền và refresh token.
          </p>
          <label>
            Email quản trị
            <input
              onChange={(event) => setLoginForm((form) => ({ ...form, email: event.target.value }))}
              required
              type="email"
              value={loginForm.email}
            />
          </label>
          <label>
            Mật khẩu
            <input
              onChange={(event) => setLoginForm((form) => ({ ...form, password: event.target.value }))}
              placeholder="Nhập bất kỳ để vào bản prototype"
              required
              type="password"
              value={loginForm.password}
            />
          </label>
          <button className="primary-action" type="submit">Đăng nhập</button>
        </form>
      </section>
    </main>
  );

  const renderOverview = () => (
    <>
      <div className="admin-stat-grid">
        <article className="admin-stat-card"><span className="admin-stat-label">Hồ sơ thảo dược</span><strong>{formatNumber(metrics.totalHerbs)}</strong><span>{formatNumber(metrics.cautionHerbs)} cần thận trọng</span></article>
        <article className="admin-stat-card danger"><span className="admin-stat-label">Cảnh báo đỏ</span><strong>{formatNumber(metrics.toxicHerbs)}</strong><span>Vị độc/cần kiểm soát chặt</span></article>
        <article className="admin-stat-card"><span className="admin-stat-label">Bài viết</span><strong>{formatNumber(metrics.posts)}</strong><span>Nội dung hướng dẫn và SEO</span></article>
        <article className="admin-stat-card"><span className="admin-stat-label">Bài thuốc</span><strong>{formatNumber(metrics.prescriptions)}</strong><span>Cổ phương và bài tham khảo</span></article>
        <article className="admin-stat-card warning"><span className="admin-stat-label">Luật rủi ro</span><strong>{formatNumber(metrics.riskyInteractions)}</strong><span>Trong {formatNumber(metrics.interactions)} quan hệ</span></article>
        <article className="admin-stat-card warning"><span className="admin-stat-label">Trang cần OCR</span><strong>{formatNumber(metrics.pendingPages)}</strong><span>{formatNumber(metrics.pendingSources)} nguồn chờ xử lý</span></article>
      </div>
      <div className="admin-split">
        <section className="admin-panel compact">
          <h3>Công cụ quản trị đã có</h3>
          <ul className="admin-checklist">
            <li>Đăng nhập/đăng xuất quản trị và lưu phiên bằng localStorage.</li>
            <li>Tạo mới, chỉnh sửa, xóa mềm trong phiên cho bài viết, vị thuốc, bài thuốc, phối ngũ và nguồn.</li>
            <li>Hàng chờ duyệt nội dung y tế theo độc tính, tương phản và trạng thái OCR.</li>
            <li>Khung dữ liệu sẵn để nối API quản trị, audit log và phân quyền.</li>
          </ul>
        </section>
        <section className="admin-panel compact">
          <h3>Thao tác nhanh</h3>
          <div className="admin-module-list">
            <button type="button" onClick={() => { setEditingPost({ ...emptyPost }); setActiveTab('posts'); }}>Đăng bài mới</button>
            <button type="button" onClick={() => { setEditingHerb({ safety_level: 'normal', use_cases: '', tags: '' }); setActiveTab('herbs'); }}>Thêm vị thuốc</button>
            <button type="button" onClick={() => { setEditingFormula({ category: '', ingredientsText: '' }); setActiveTab('formulas'); }}>Thêm bài thuốc</button>
            <button type="button" onClick={() => { setEditingSource({ extractionStatus: 'scan-needs-ocr' }); setActiveTab('sources'); }}>Thêm nguồn PDF</button>
          </div>
        </section>
      </div>
    </>
  );

  const renderPosts = () => (
    <>
      <div className="admin-toolbar">
        <button className="primary-action compact" type="button" onClick={() => setEditingPost({ ...emptyPost })}>Đăng bài mới</button>
      </div>
      {editingPost && (
        <form className="admin-editor" onSubmit={savePost}>
          <div className="admin-form-grid">
            <label>Tiêu đề<input required value={editingPost.title} onChange={(event) => setEditingPost({ ...editingPost, title: event.target.value })} /></label>
            <label>Danh mục<input value={editingPost.category} onChange={(event) => setEditingPost({ ...editingPost, category: event.target.value })} /></label>
            <label>Trạng thái<select value={editingPost.status} onChange={(event) => setEditingPost({ ...editingPost, status: event.target.value })}><option value="draft">Nháp</option><option value="review">Chờ duyệt</option><option value="published">Xuất bản</option></select></label>
            <label>Nguồn tham khảo<input value={editingPost.source} onChange={(event) => setEditingPost({ ...editingPost, source: event.target.value })} /></label>
          </div>
          <label>Tóm tắt<textarea rows="2" value={editingPost.excerpt} onChange={(event) => setEditingPost({ ...editingPost, excerpt: event.target.value })} /></label>
          <label>Nội dung bài viết<textarea rows="8" value={editingPost.body} onChange={(event) => setEditingPost({ ...editingPost, body: event.target.value })} /></label>
          <div className="admin-editor-actions"><button className="primary-action compact" type="submit">Lưu bài viết</button><button type="button" onClick={() => setEditingPost(null)}>Hủy</button></div>
        </form>
      )}
      <div className="admin-list">
        {managedPosts.map((post) => (
          <article className="admin-list-row" key={post.id}>
            <div><span className="admin-mini-tag">{post.category}</span><h3>{post.title}</h3><p>{post.excerpt}</p></div>
            <div className="admin-row-actions"><span className={`status-pill ${post.status === 'published' ? 'normal' : 'warning'}`}>{post.status}</span><button type="button" onClick={() => setEditingPost(post)}>Sửa</button><button type="button" onClick={() => { setManagedPosts((items) => items.filter((item) => item.id !== post.id)); addAudit('Xóa bài viết', post.title); }}>Xóa</button></div>
          </article>
        ))}
      </div>
    </>
  );

  const renderHerbs = () => (
    <>
      <div className="admin-toolbar">
        <input className="admin-search" onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên Việt, Hán Việt, tên khoa học..." type="search" value={query} />
        <select value={safetyFilter} onChange={(event) => setSafetyFilter(event.target.value)}><option value="all">Tất cả mức an toàn</option><option value="normal">Thông thường</option><option value="caution">Cần thận trọng</option><option value="toxic">Cảnh báo đỏ</option></select>
        <button className="primary-action compact" type="button" onClick={() => setEditingHerb({ safety_level: 'normal', use_cases: '', tags: '' })}>Thêm vị thuốc</button>
      </div>
      {editingHerb && (
        <form className="admin-editor" onSubmit={saveHerb}>
          <div className="admin-form-grid">
            <label>Tên Việt<input required value={editingHerb.name_vn || ''} onChange={(event) => setEditingHerb({ ...editingHerb, name_vn: event.target.value })} /></label>
            <label>Hán Việt<input value={editingHerb.name_han || ''} onChange={(event) => setEditingHerb({ ...editingHerb, name_han: event.target.value })} /></label>
            <label>Tên khoa học<input value={editingHerb.scientific_name || ''} onChange={(event) => setEditingHerb({ ...editingHerb, scientific_name: event.target.value })} /></label>
            <label>Nhóm thuốc<input value={editingHerb.category || ''} onChange={(event) => setEditingHerb({ ...editingHerb, category: event.target.value })} /></label>
            <label>URL hình ảnh<input value={editingHerb.image || ''} onChange={(event) => setEditingHerb({ ...editingHerb, image: event.target.value })} placeholder="https://... hoặc /images/ten-file.png" /></label>
            <label>Tính<input value={editingHerb.properties || ''} onChange={(event) => setEditingHerb({ ...editingHerb, properties: event.target.value })} /></label>
            <label>Vị<input value={editingHerb.taste || ''} onChange={(event) => setEditingHerb({ ...editingHerb, taste: event.target.value })} /></label>
            <label>Quy kinh<input value={editingHerb.meridians || ''} onChange={(event) => setEditingHerb({ ...editingHerb, meridians: event.target.value })} /></label>
            <label>Bộ phận dùng<input value={editingHerb.part_used || ''} onChange={(event) => setEditingHerb({ ...editingHerb, part_used: event.target.value })} /></label>
            <label>Mức an toàn<select value={editingHerb.safety_level || 'normal'} onChange={(event) => setEditingHerb({ ...editingHerb, safety_level: event.target.value })}><option value="normal">Thông thường</option><option value="caution">Cần thận trọng</option><option value="toxic">Cảnh báo đỏ</option></select></label>
            <label>Công dụng tags<input value={editingHerb.use_cases || ''} onChange={(event) => setEditingHerb({ ...editingHerb, use_cases: event.target.value })} placeholder="tonic, tea, digestion" /></label>
          </div>
          <label>Tóm tắt cơ bản<textarea rows="3" value={editingHerb.basic_summary || ''} onChange={(event) => setEditingHerb({ ...editingHerb, basic_summary: event.target.value })} /></label>
          {editingHerb.image && (
            <div className="admin-image-preview">
              <span>Preview ảnh thảo dược</span>
              <img alt={editingHerb.name_vn || 'Preview thảo dược'} src={editingHerb.image} />
            </div>
          )}
          <label>Cách dùng chuyên sâu<textarea rows="3" value={editingHerb.detailed_usage || ''} onChange={(event) => setEditingHerb({ ...editingHerb, detailed_usage: event.target.value })} /></label>
          <label>Cảnh báo<textarea rows="3" value={editingHerb.warnings || ''} onChange={(event) => setEditingHerb({ ...editingHerb, warnings: event.target.value })} /></label>
          <label>Nguồn/citation<input value={editingHerb.source_label || editingHerb.source_refs?.[0]?.label || ''} onChange={(event) => setEditingHerb({ ...editingHerb, source_label: event.target.value })} /></label>
          <div className="admin-editor-actions"><button className="primary-action compact" type="submit">Lưu hồ sơ</button><button type="button" onClick={() => setEditingHerb(null)}>Hủy</button></div>
        </form>
      )}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Ảnh</th><th>Tên vị thuốc</th><th>Phân nhóm</th><th>Tính vị</th><th>Công dụng</th><th>An toàn</th><th>Thao tác</th></tr></thead>
          <tbody>{filteredHerbs.map((herb) => (
            <tr key={herb.id}>
              <td><span className="admin-herb-thumb" style={{ backgroundImage: `url(${herb.image})` }} /></td>
              <td><strong>{herb.name_vn}</strong><span>{herb.scientific_name || herb.name_han}</span></td>
              <td>{herb.category || 'Chưa phân nhóm'}</td>
              <td>{[herb.properties, herb.taste].filter(Boolean).join(' · ') || 'Chưa nhập'}</td>
              <td><div className="admin-tag-row">{herb.use_cases?.slice(0, 3).map((useCase) => <span key={useCase} className="admin-mini-tag">{getUseCaseShortLabel(useCase)}</span>)}</div></td>
              <td><span className={`status-pill ${safetyMeta[herb.safety_level]?.tone || 'normal'}`}>{statusLabel[herb.safety_level] || herb.safety_level}</span></td>
              <td><div className="admin-row-actions"><button type="button" onClick={() => setEditingHerb({ ...herb, tags: herb.tags?.join(', '), use_cases: herb.use_cases?.join(', ') })}>Sửa</button><button type="button" onClick={() => { setManagedHerbs((items) => items.filter((item) => item.id !== herb.id)); addAudit('Xóa vị thuốc', herb.name_vn); }}>Xóa</button></div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );

  const renderFormulas = () => (
    <>
      <div className="admin-toolbar"><button className="primary-action compact" type="button" onClick={() => setEditingFormula({ category: '', ingredientsText: '' })}>Thêm bài thuốc</button></div>
      {editingFormula && (
        <form className="admin-editor" onSubmit={saveFormula}>
          <div className="admin-form-grid">
            <label>Tên bài thuốc<input required value={editingFormula.name || ''} onChange={(event) => setEditingFormula({ ...editingFormula, name: event.target.value })} /></label>
            <label>Nguồn<input value={editingFormula.source || ''} onChange={(event) => setEditingFormula({ ...editingFormula, source: event.target.value })} /></label>
            <label>Nhóm bài<input value={editingFormula.category || ''} onChange={(event) => setEditingFormula({ ...editingFormula, category: event.target.value })} /></label>
            <label>Công dụng<input value={editingFormula.usage || ''} onChange={(event) => setEditingFormula({ ...editingFormula, usage: event.target.value })} /></label>
          </div>
          <label>Chỉ định tham khảo<textarea rows="3" value={editingFormula.indications || ''} onChange={(event) => setEditingFormula({ ...editingFormula, indications: event.target.value })} /></label>
          <label>Thành phần, mỗi dòng: Tên | Liều | Vai trò<textarea rows="5" value={editingFormula.ingredientsText || editingFormula.ingredients?.map((item) => `${item.name} | ${item.dosage} | ${item.role}`).join('\n') || ''} onChange={(event) => setEditingFormula({ ...editingFormula, ingredientsText: event.target.value })} /></label>
          <label>Cảnh báo<textarea rows="3" value={editingFormula.caution || ''} onChange={(event) => setEditingFormula({ ...editingFormula, caution: event.target.value })} /></label>
          <div className="admin-editor-actions"><button className="primary-action compact" type="submit">Lưu bài thuốc</button><button type="button" onClick={() => setEditingFormula(null)}>Hủy</button></div>
        </form>
      )}
      <div className="admin-card-grid">{managedPrescriptions.map((formula) => (
        <article className="admin-record-card" key={formula.id}><div><span className="admin-mini-tag">{formula.category}</span><h3>{formula.name}</h3><p>{formula.usage}</p></div><dl><div><dt>Thành phần</dt><dd>{formula.ingredients?.length || 0} vị</dd></div><div><dt>Nguồn</dt><dd>{formula.source}</dd></div></dl><div className="admin-editor-actions"><button type="button" onClick={() => setEditingFormula({ ...formula })}>Sửa</button><button type="button" onClick={() => { setManagedPrescriptions((items) => items.filter((item) => item.id !== formula.id)); addAudit('Xóa bài thuốc', formula.name); }}>Xóa</button></div></article>
      ))}</div>
    </>
  );

  const renderPairing = () => (
    <>
      <div className="admin-toolbar"><button className="primary-action compact" type="button" onClick={() => setEditingInteraction({ type: 'Tương tu', severity: 'positive' })}>Thêm luật phối ngũ</button></div>
      {editingInteraction && (
        <form className="admin-editor" onSubmit={saveInteraction}>
          <div className="admin-form-grid">
            <label>Vị A<input required value={editingInteraction.herb1 || ''} onChange={(event) => setEditingInteraction({ ...editingInteraction, herb1: event.target.value })} /></label>
            <label>Vị B<input required value={editingInteraction.herb2 || ''} onChange={(event) => setEditingInteraction({ ...editingInteraction, herb2: event.target.value })} /></label>
            <label>Loại<select value={editingInteraction.type || 'Tương tu'} onChange={(event) => setEditingInteraction({ ...editingInteraction, type: event.target.value })}><option>Tương tu</option><option>Tương sử</option><option>Tương phản</option><option>Tương úy</option></select></label>
            <label>Mức<select value={editingInteraction.severity || 'positive'} onChange={(event) => setEditingInteraction({ ...editingInteraction, severity: event.target.value })}><option value="positive">positive</option><option value="controlled">controlled</option><option value="high">high</option></select></label>
          </div>
          <label>Ghi chú<textarea rows="3" value={editingInteraction.note || ''} onChange={(event) => setEditingInteraction({ ...editingInteraction, note: event.target.value })} /></label>
          <div className="admin-editor-actions"><button className="primary-action compact" type="submit">Lưu luật</button><button type="button" onClick={() => setEditingInteraction(null)}>Hủy</button></div>
        </form>
      )}
      <div className="admin-list">{managedInteractions.slice(0, 120).map((item, index) => (
        <article className="admin-list-row" key={item.id || `${item.herb1}-${item.herb2}-${index}`}><div><h3>{item.herb1} + {item.herb2}</h3><p>{item.note}</p></div><div className="admin-row-actions"><span className={`status-pill ${item.severity === 'high' ? 'danger' : item.severity === 'controlled' ? 'warning' : 'normal'}`}>{item.type}</span><button type="button" onClick={() => setEditingInteraction({ ...item, id: item.id || `${item.herb1}-${item.herb2}-${index}` })}>Sửa</button><button type="button" onClick={() => { setManagedInteractions((items) => items.filter((_, itemIndex) => itemIndex !== index)); addAudit('Xóa phối ngũ', `${item.herb1} + ${item.herb2}`); }}>Xóa</button></div></article>
      ))}</div>
    </>
  );

  const renderSources = () => (
    <>
      <div className="admin-toolbar"><button className="primary-action compact" type="button" onClick={() => setEditingSource({ extractionStatus: 'scan-needs-ocr' })}>Thêm nguồn PDF</button></div>
      {editingSource && (
        <form className="admin-editor" onSubmit={saveSource}>
          <div className="admin-form-grid">
            <label>Tên nguồn<input required value={editingSource.title || ''} onChange={(event) => setEditingSource({ ...editingSource, title: event.target.value })} /></label>
            <label>Tác giả<input value={editingSource.author || ''} onChange={(event) => setEditingSource({ ...editingSource, author: event.target.value })} /></label>
            <label>Loại<input value={editingSource.type || ''} onChange={(event) => setEditingSource({ ...editingSource, type: event.target.value })} /></label>
            <label>Số trang<input min="0" type="number" value={editingSource.pages || ''} onChange={(event) => setEditingSource({ ...editingSource, pages: event.target.value })} /></label>
            <label>File local<input value={editingSource.localFile || ''} onChange={(event) => setEditingSource({ ...editingSource, localFile: event.target.value })} /></label>
            <label>Trạng thái<select value={editingSource.extractionStatus || 'scan-needs-ocr'} onChange={(event) => setEditingSource({ ...editingSource, extractionStatus: event.target.value })}><option value="scan-needs-ocr">Cần OCR</option><option value="extracted">Đã tách text</option><option value="reviewed">Đã duyệt</option></select></label>
          </div>
          <label>Ghi chú<textarea rows="3" value={editingSource.note || ''} onChange={(event) => setEditingSource({ ...editingSource, note: event.target.value })} /></label>
          <div className="admin-editor-actions"><button className="primary-action compact" type="submit">Lưu nguồn</button><button type="button" onClick={() => setEditingSource(null)}>Hủy</button></div>
        </form>
      )}
      <div className="admin-card-grid two">{managedSources.map((source) => (
        <article className="admin-record-card" key={source.id}><div><span className="admin-mini-tag">{source.type}</span><h3>{source.title}</h3><p>{source.author}</p></div><dl><div><dt>Số trang</dt><dd>{formatNumber(source.pages)}</dd></div><div><dt>Trạng thái</dt><dd>{source.extractionStatus}</dd></div></dl><p>{source.note}</p><div className="admin-editor-actions"><span className={`status-pill ${sourceNeedsReview(source) ? 'warning' : 'normal'}`}>{sourceNeedsReview(source) ? 'Cần OCR' : 'Đã xử lý'}</span><button type="button" onClick={() => setEditingSource({ ...source })}>Sửa</button><button type="button" onClick={() => { setManagedSources((items) => items.filter((item) => item.id !== source.id)); addAudit('Xóa nguồn', source.title); }}>Xóa</button></div></article>
      ))}</div>
    </>
  );

  const renderReview = () => (
    <div className="admin-list">{reviewQueue.map((item) => (
      <article className="admin-list-row" key={item.id}><div><span className="admin-mini-tag">{item.type}</span><h3>{item.title}</h3><p>{item.note}</p></div><div className="admin-row-actions"><span className={`status-pill ${item.priority === 'Cao' ? 'danger' : 'warning'}`}>Ưu tiên {item.priority}</span><button type="button" onClick={() => showNotice('Đã đánh dấu mục này là đang duyệt.')}>Nhận duyệt</button></div></article>
    ))}</div>
  );

  const renderAudit = () => (
    <div className="admin-list">
      {auditLog.length === 0 && <div className="empty-state compact"><p>Chưa có nhật ký thao tác.</p></div>}
      {auditLog.map((item) => (
        <article className="admin-list-row" key={item.id}>
          <div>
            <span className="admin-mini-tag">{item.actor}</span>
            <h3>{item.action}</h3>
            <p>{item.target}</p>
          </div>
          <span className="status-pill normal">{item.at}</span>
        </article>
      ))}
    </div>
  );

  const renderSettings = () => (
    <div className="admin-split">
      <section className="admin-panel compact">
        <h3>Sao lưu dữ liệu</h3>
        <p className="admin-muted">Xuất/nhập toàn bộ dữ liệu quản trị đang lưu trong trình duyệt.</p>
        <div className="admin-editor-actions">
          <button className="primary-action compact" type="button" onClick={exportBackup}>Xuất JSON</button>
          <label className="admin-upload-button">
            Nhập JSON
            <input accept="application/json" onChange={importBackup} type="file" />
          </label>
          <button type="button" onClick={resetLocalData}>Khôi phục seed</button>
        </div>
      </section>
      <section className="admin-panel compact"><h3>Phân quyền đề xuất</h3><ul className="admin-checklist"><li>Admin: quản lý người dùng, schema, taxonomy, publish.</li><li>Editor: tạo/sửa nháp, OCR, citation.</li><li>Reviewer: duyệt nội dung y tế, cảnh báo, tương phản.</li></ul></section>
      <section className="admin-panel compact"><h3>API cần nối tiếp</h3><ul className="admin-checklist"><li>`POST /admin/login` xác thực.</li><li>`POST/PATCH /admin/herbs` lưu hồ sơ vị thuốc.</li><li>`POST/PATCH /admin/posts` đăng bài viết.</li><li>`POST /admin/reviews/:id/approve` duyệt nội dung.</li></ul></section>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'posts': return renderPosts();
      case 'herbs': return renderHerbs();
      case 'formulas': return renderFormulas();
      case 'pairing': return renderPairing();
      case 'sources': return renderSources();
      case 'review': return renderReview();
      case 'audit': return renderAudit();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  if (!session) return renderLogin();

  return (
    <main className="admin-page">
      <header className="admin-header container">
        <span className="eyebrow">Admin content system</span>
        <h1>Quản lý dữ liệu Đông y</h1>
        <p>Quản lý bài viết, hồ sơ vị thuốc, bài thuốc, luật phối ngũ, nguồn PDF/OCR và hàng chờ duyệt an toàn.</p>
      </header>

      <section className="admin-shell container">
        <aside className="admin-sidebar" aria-label="Admin navigation">
          <div className="admin-profile"><strong>{session.name}</strong><span>{session.role}</span></div>
          {adminTabs.map((tab) => (
            <button className={activeTab === tab.id ? 'active' : ''} key={tab.id} onClick={() => setActiveTab(tab.id)} type="button">{tab.label}</button>
          ))}
          <button type="button" onClick={handleLogout}>Đăng xuất</button>
        </aside>

        <div className="admin-panel">
          <div className="admin-panel-heading">
            <div><span className="eyebrow">Bách Thảo Kính CMS</span><h2>{adminTabs.find((tab) => tab.id === activeTab)?.label}</h2></div>
            <span className="status-pill normal">Frontend prototype</span>
          </div>
          {notice && <div className="admin-notice">{notice}</div>}
          {renderActiveTab()}
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;
