import React, { useEffect, useState, useCallback } from "react";
import { auth, db } from "../services/firebase";
import { decryptField } from "../services/encryption";
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import './ViewAssets.css';
import Sidebar from "../layout/Sidebar";
import { useNavigate } from "react-router-dom";

function ViewAssets() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNominee, setEditingNominee] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", relationship: "", phone: "" });
  const [showPassword, setShowPassword] = useState({});
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('assets');
  const [searchQuery, setSearchQuery] = useState('');
  // expandedAsset state removed for stable layout
  // categories removed for clean UI

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const assetsQuery = query(
        collection(db, "assets"),
        where("userId", "==", auth.currentUser.uid)
      );
      const assetsSnapshot = await getDocs(assetsQuery);
      const assetsData = assetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const userEmail = auth.currentUser?.email || '';
      const processedAssets = assetsData.map(asset => {
        let decryptedCredentials = '[No Credentials]';
        if (asset.encryptedCredentials) {
          decryptedCredentials = decryptField(asset.encryptedCredentials, userEmail);
        }
        return { ...asset, decryptedCredentials };
      }).sort((a, b) => {
        const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(0);
        const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(0);
        return dateB - dateA; // descending by added date
      });

      const nomineesQuery = query(
        collection(db, "nominees"),
        where("userId", "==", auth.currentUser.uid)
      );
      const nomineesSnapshot = await getDocs(nomineesQuery);
      const nomineesData = nomineesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setAssets(processedAssets);
      setNominees(nomineesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter(asset =>
    asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.identifier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (asset.tags && asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const togglePassword = (assetId) => {
    setShowPassword(prev => ({
      ...prev,
      [assetId]: !prev[assetId]
    }));
  };



  const copyCredentials = async (text) => {
    if (!text || text === '[No Credentials]' || text === '[Decryption Failed]') return;
    try {
      await navigator.clipboard.writeText(text);
setToast('[OK] Copied to clipboard!');
      setTimeout(() => setToast(''), 2000);
    } catch (err) {
      setToast('❌ Copy failed');
      setTimeout(() => setToast(''), 2000);
    }
  };

  const handleEditNominee = (nominee) => {
    setEditingNominee(nominee.id);
    setEditForm({
      name: nominee.name,
      email: nominee.email,
      relationship: nominee.relationship,
      phone: nominee.phone || ""
    });
  };

  const handleUpdateNominee = async () => {
    if (!editForm.name || !editForm.email || !editForm.relationship) {
      alert("Please fill in all required fields");
      return;
    }
    try {
      await updateDoc(doc(db, "nominees", editingNominee), {
        ...editForm,
        updatedAt: new Date()
      });
      setEditingNominee(null);
      setEditForm({ name: "", email: "", relationship: "", phone: "" });
      fetchData();
setToast('[OK] Nominee updated successfully!');
    } catch (error) {
      setToast('❌ Error updating nominee: ' + error.message);
    }
  };

  const handleDeleteNominee = async (nomineeId) => {
    if (window.confirm("Are you sure you want to delete this nominee?")) {
      try {
        await deleteDoc(doc(db, "nominees", nomineeId));
        fetchData();
setToast('[OK] Nominee deleted successfully!');
      } catch (error) {
        setToast('❌ Error deleting nominee: ' + error.message);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingNominee(null);
    setEditForm({ name: "", email: "", relationship: "", phone: "" });
  };

  if (loading) {
    return (
      <div className="view-assets-container">
        <Sidebar />
        <div className="view-assets-main">
          <div className="empty-state">
            <div className="empty-icon">⏳</div>
            <p>Loading your digital legacy...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="view-assets-container">
      <Sidebar />
      <div className="view-assets-main">
        {toast && <div className="toast">{toast}</div>}

        <div className="view-assets-header">
          <h1 className="view-assets-title">Your Digital Legacy</h1>
          <p className="view-assets-subtitle">All your important information in one secure place • Passwords masked by default</p>
        </div>

        {activeTab === 'assets' && (
          <div className="search-container">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              className="search-input"
              placeholder="Search assets by title, identifier or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'assets' ? 'active' : ''}`}
            onClick={() => setActiveTab('assets')}
          >
            Assets ({assets.length})
          </button>
          <button 
            className={`tab ${activeTab === 'nominees' ? 'active' : ''}`}
            onClick={() => setActiveTab('nominees')}
          >
            Nominees ({nominees.length})
          </button>
          <button 
            className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
        </div>

        {activeTab === 'assets' && (
          <div className="view-assets-section">
            <h2 className="view-assets-section-title">
              Your Assets ({filteredAssets.length} of {assets.length})
            </h2>
            
            {filteredAssets.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <p>{searchQuery ? 'No assets match your search.' : 'No assets yet.'}</p>
                {searchQuery && (
                  <button className="btn btn-primary" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="assets-grid">
                {filteredAssets.map((asset) => {
                  const isShowingPassword = showPassword[asset.id];

                  return (
                    <div 
                      key={asset.id} 
                      className="asset-card"
                    >
                      <div className="asset-header">
                        <div className="asset-content">
                          <h3 className="asset-title">{asset.title}</h3>
                          <div className="asset-tags">
                            {asset.tags?.map((tag, idx) => (
                              <span key={idx} className="tag-chip" style={{ backgroundColor: getTagColor(tag) }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="asset-header-details">
                            <div className="detail-row">
                              <span className="detail-label">ID:</span>
                              <span className="detail-value">{asset.identifier || 'N/A'}</span>
                            </div>
                          </div>
                          
                          <div className="creds-row">
                            <span className="detail-label">Password / Credentials:</span>
                            <span className="detail-value password-display">
                              {isShowingPassword
                                ? asset.decryptedCredentials
                                : '......'
                              }
                            </span>
                            <button
                              className="btn btn-success password-toggle"
                              onClick={(e) => { e.stopPropagation(); togglePassword(asset.id); }}
                              title={isShowingPassword ? 'Hide' : 'Show'}
                            >
                              {isShowingPassword ? '🙈' : '👁️'}
                            </button>
                            <button
                              className="btn btn-success"
                              onClick={(e) => { e.stopPropagation(); copyCredentials(asset.decryptedCredentials); }}
                              title="Copy to clipboard"
                            >
                              📋
                            </button>

                          </div>
                          
                          <div className="asset-meta">
                            <small>Added: {asset.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'nominees' && (
          <div className="view-assets-section">
            <h2 className="view-assets-section-title">Your Nominees ({nominees.length})</h2>
            {nominees.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👤</div>
                <p>No nominees added yet.</p>
                <button className="btn btn-primary" onClick={() => navigate("/nominee")}>
                  ➕ Add Trusted Nominees
                </button>
              </div>
            ) : (
              <div className="nominees-grid">
                {nominees.map((nominee) => (
                  <div key={nominee.id} className="nominee-card">
                    {editingNominee === nominee.id ? (
                      <div className="edit-form">
                        <h3>Edit Nominee</h3>
                        <input
                          type="text"
                          className="edit-input"
                          placeholder="Full Name *"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        />
                        <input
                          type="email"
                          className="edit-input"
                          placeholder="Email *"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        />
                        <input
                          type="text"
                          className="edit-input"
                          placeholder="Relationship *"
                          value={editForm.relationship}
                          onChange={(e) => setEditForm({...editForm, relationship: e.target.value})}
                        />
                        <input
                          type="tel"
                          className="edit-input"
                          placeholder="Phone (optional)"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        />
                        <div className="edit-buttons">
                          <button className="btn btn-save" onClick={handleUpdateNominee}>💾 Save</button>
                          <button className="btn btn-cancel" onClick={handleCancelEdit}>❌ Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="nominee-header">
                          <h3>{nominee.name}</h3>
                          <div className="nominee-actions">
                            <button className="btn btn-secondary btn-small" onClick={() => handleEditNominee(nominee)}>
                              ✏️ Edit
                            </button>
                            <button className="btn btn-danger btn-small" onClick={() => handleDeleteNominee(nominee.id)}>
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                        <div className="nominee-details">
                          <div className="detail-row">
                            <span className="detail-label">📧 Email:</span>
                            <span className="detail-value">{nominee.email}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">👨‍👩‍👧‍👦 Relationship:</span>
                            <span className="detail-value">{nominee.relationship}</span>
                          </div>
                          {nominee.phone && (
                            <div className="detail-row">
                              <span className="detail-label">📞 Phone:</span>
                              <span className="detail-value">{nominee.phone}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="view-assets-section">
            <h2 className="view-assets-section-title">Legacy Summary</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-number">{assets.length}</span>
                <span className="summary-label">Digital Assets</span>
              </div>
              <div className="summary-item">
                <span className="summary-number">{nominees.length}</span>
                <span className="summary-label">Trusted Nominees</span>
              </div>
              <div className="summary-item">
                <span className="summary-number">{new Set(assets.map(a => a.category || (a.tags && a.tags[0]) || 'other')).size}</span>
                <span className="summary-label">Categories</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const getTagColor = (tag) => {
  const colors = {
    'Finance': '#10b981', 'Banking': '#10b981',
    'Work': '#3b82f6', 'Professional': '#3b82f6',
    'Social': '#8b5cf6',
    'Education': '#f59e0b',
    'Health': '#ef4444',
    'Crypto': '#f97316',
    'Email': '#06b6d4',
    'Shopping': '#14b8b4',
    'Streaming': '#ec4899',
  };
  return colors[tag] || '#6366f1';
};

export default ViewAssets;

