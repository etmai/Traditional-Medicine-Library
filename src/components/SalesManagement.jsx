import React, { useState } from 'react';

function SalesManagement({ sales, setSales }) {
  const [formData, setFormData] = useState({
    account: '',
    sku: '',
    merchant: '',
    category: '',
    sales: '',
    date: new Date().toISOString().split('T')[0],
    title: ''
  });
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    if (!formData.sku) return alert('Please enter SKU first');
    setIsScanning(true);
    
    // Simulating Amazon scan logic
    // In a real app, this would call a backend proxy or use Amazon SP-API
    setTimeout(() => {
      const mockTitles = {
        'B07PR1Y8JL': 'Echo Dot (3rd Gen) - Smart speaker with Alexa',
        'B08N5WRWJ5': 'MacBook Air M1 Chip - 13.3-inch Laptop',
        'B0C46B1C9V': 'Kindle Paperwhite (16 GB) - Now with a 6.8" display',
      };
      
      const foundTitle = mockTitles[formData.sku] || `Product Title for SKU: ${formData.sku}`;
      setFormData(prev => ({ ...prev, title: foundTitle }));
      setIsScanning(false);
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.sku || !formData.sales) return;
    setSales([...sales, { ...formData, id: Date.now() }]);
    setFormData({
      account: '',
      sku: '',
      merchant: '',
      category: '',
      sales: '',
      date: new Date().toISOString().split('T')[0],
      title: ''
    });
  };

  return (
    <div className="section">
      <h1>Product & Sales Management</h1>

      <div className="card">
        <h3>Input Daily Sales Data</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid">
            <div className="form-group">
              <label>Account</label>
              <input type="text" value={formData.account} onChange={e => setFormData({...formData, account: e.target.value})} placeholder="e.g. Etsy_Main" />
            </div>
            <div className="form-group">
              <label>SKU (Amazon)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="B0..." />
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={handleScan}
                  disabled={isScanning}
                  style={{ whiteSpace: 'nowrap', padding: '0 1rem' }}
                >
                  {isScanning ? <span className="loader"></span> : 'Scan'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Merchant</label>
              <input type="text" value={formData.merchant} onChange={e => setFormData({...formData, merchant: e.target.value})} placeholder="Amazon/Etsy" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Electronics" />
            </div>
            <div className="form-group">
              <label>Sales (Units)</label>
              <input type="number" value={formData.sales} onChange={e => setFormData({...formData, sales: e.target.value})} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
          </div>
          
          {formData.title && (
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Fetched Product Title</label>
              <input type="text" value={formData.title} readOnly style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--success)' }} />
            </div>
          )}

          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button className="btn-primary" type="submit" disabled={!formData.title}>Save Entry</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Recent Sales Entries</h3>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>SKU</th>
                <th>Title</th>
                <th>Account</th>
                <th>Merchant</th>
                <th>Category</th>
                <th>Units</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice().reverse().map(entry => (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{entry.sku}</td>
                  <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.title}</td>
                  <td>{entry.account}</td>
                  <td>{entry.merchant}</td>
                  <td>{entry.category}</td>
                  <td style={{ color: 'var(--warning)', fontWeight: 'bold' }}>{entry.sales}</td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No sales data recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SalesManagement;
