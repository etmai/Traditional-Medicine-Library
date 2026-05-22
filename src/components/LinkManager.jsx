import React, { useState } from 'react';

function LinkManager({ links, setLinks }) {
  const [newLink, setNewLink] = useState({ title: '', url: '', category: 'General' });

  const addLink = (e) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url) return;
    setLinks([...links, { ...newLink, id: Date.now() }]);
    setNewLink({ title: '', url: '', category: 'General' });
  };

  const deleteLink = (id) => {
    setLinks(links.filter(link => link.id !== id));
  };

  return (
    <div className="section">
      <h1>Link Management</h1>
      
      <div className="card">
        <h3>Add New Link</h3>
        <form onSubmit={addLink} className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', alignItems: 'end' }}>
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              value={newLink.title} 
              onChange={e => setNewLink({ ...newLink, title: e.target.value })} 
              placeholder="e.g. Amazon Storefront"
            />
          </div>
          <div className="form-group">
            <label>URL</label>
            <input 
              type="text" 
              value={newLink.url} 
              onChange={e => setNewLink({ ...newLink, url: e.target.value })} 
              placeholder="https://..."
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={newLink.category} onChange={e => setNewLink({ ...newLink, category: e.target.value })}>
              <option>General</option>
              <option>Marketing</option>
              <option>Social</option>
              <option>Sales</option>
            </select>
          </div>
          <div className="form-group">
            <button className="btn-primary" type="submit">Add Link</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Managed Links</h3>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>URL</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.map(link => (
              <tr key={link.id}>
                <td>{link.title}</td>
                <td style={{ color: 'var(--primary)', fontStyle: 'italic' }}>{link.url}</td>
                <td><span className="badge">{link.category}</span></td>
                <td>
                  <button 
                    onClick={() => deleteLink(link.id)} 
                    style={{ background: 'transparent', color: 'var(--danger)', border: 'none' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {links.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No links added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LinkManager;
