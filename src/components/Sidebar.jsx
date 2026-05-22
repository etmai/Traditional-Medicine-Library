import React from 'react';

function Sidebar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'links', label: 'Link Manager', icon: '🔗' },
    { id: 'sales', label: 'Product Sales', icon: '🛍️' },
    { id: 'stats', label: 'Statistics', icon: '📈' },
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        <span style={{ marginRight: '8px' }}>✨</span>
        <span>CELESTIAL</span>
      </div>
      <nav className="nav-links">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
