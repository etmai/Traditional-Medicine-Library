import React, { useMemo } from 'react';

function Statistics({ sales }) {
  const stats = useMemo(() => {
    // Current date for relative calculations
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    const getTopProducts = (startDate) => {
      const filtered = sales.filter(s => new Date(s.date) >= startDate);
      const grouped = {};
      filtered.forEach(s => {
        if (!grouped[s.sku]) grouped[s.sku] = { ...s, totalSales: 0 };
        grouped[s.sku].totalSales += parseInt(s.sales || 0);
      });
      return Object.values(grouped).sort((a, b) => b.totalSales - a.totalSales).slice(0, 5);
    };

    return {
      topWeekly: getTopProducts(oneWeekAgo),
      topMonthly: getTopProducts(oneMonthAgo)
    };
  }, [sales]);

  return (
    <div className="section">
      <h1>Sales Statistics</h1>
      
      <div className="grid">
        <div className="card">
          <h3>Top 5 Products (Week)</h3>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Title</th>
                <th>Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {stats.topWeekly.map(p => (
                <tr key={`${p.sku}-week`}>
                  <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{p.sku}</td>
                  <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{p.totalSales}</td>
                </tr>
              ))}
              {stats.topWeekly.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No weekly data yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Top 5 Products (Month)</h3>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Title</th>
                <th>Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {stats.topMonthly.map(p => (
                <tr key={`${p.sku}-month`}>
                  <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{p.sku}</td>
                  <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{p.totalSales}</td>
                </tr>
              ))}
              {stats.topMonthly.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No monthly data yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Performance Insights</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '1rem' }}>
          <div className="stat-card">
            <div className="stat-label">Best Selling Category</div>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>
              {sales.length > 0 ? (
                [...new Set(sales.map(s => s.category))].sort((a,b) => 
                  sales.filter(s => s.category === b).length - sales.filter(s => s.category === a).length
                )[0]
              ) : 'N/A'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Top Merchant</div>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>
               {sales.length > 0 ? (
                [...new Set(sales.map(s => s.merchant))].sort((a,b) => 
                  sales.filter(s => s.merchant === b).length - sales.filter(s => s.merchant === a).length
                )[0]
              ) : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics;
