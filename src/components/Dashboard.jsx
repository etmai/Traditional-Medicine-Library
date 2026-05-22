import React from 'react';

function Dashboard({ links, sales }) {
  const totalSales = sales.reduce((acc, curr) => acc + parseInt(curr.sales || 0), 0);
  const totalLinks = links.length;
  const uniqueSkus = [...new Set(sales.map(s => s.sku))].length;

  return (
    <div className="section">
      <h1 className="logo">Overview Dashboard</h1>
      <div className="grid">
        <div className="card stat-card">
          <div className="stat-value">{totalLinks}</div>
          <div className="stat-label">Total Links Managed</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{totalSales}</div>
          <div className="stat-label">Units Sold (Monthly)</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{uniqueSkus}</div>
          <div className="stat-label">Active SKUs</div>
        </div>
      </div>

      <div className="card">
        <h2>System Insights</h2>
        <p style={{ color: 'var(--text-dim)' }}>
          Welcome back, Admin. The system is currently tracking <strong>{totalLinks}</strong> destination links 
          and monitoring sales across <strong>{uniqueSkus}</strong> Amazon/Etsy products.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
