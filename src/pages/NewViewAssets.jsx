import React, { useEffect, useState, useCallback } from "react";
import { auth, db } from "../services/firebase";
import { decryptField } from "../services/encryption";
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import Sidebar from "../layout/Sidebar";
import { useNavigate } from "react-router-dom";
import TagInput from "../components/TagInput"; // For tag display helper

function ViewAssets() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNominee, setEditingNominee] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", relationship: "", phone: "" });
  const [showPassword, setShowPassword] = useState({});
  const [toast, setToast] = useState('');

  const categories = [
{ value: "password", label: "Password/Credentials" },
    // ... (keep existing for legacy)
  ];

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
      let assetsData = assetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Decrypt credentials for each asset (new & legacy support)
      assetsData = assetsData.map(asset => {
        let decryptedCredentials = '[No Credentials]';
        const userEmail = auth.currentUser.email;
        if (asset.encryptedCredentials) {
          decryptedCredentials = decryptField(asset.encryptedCredentials, userEmail);
        } else if (asset.fields) {
          // Legacy: find password field
          const passwordField = asset.fields.find(f => 
            f.fieldName.toLowerCase().includes('password') || 
            f.fieldName.toLowerCase().includes('credentials') ||
            f.fieldName.toLowerCase().includes('pin')
          );
          if (passwordField) {
            decryptedCredentials = decryptField(passwordField.encryptedValue, userEmail);
          }
        }
        return { ...asset, decryptedCredentials };
      });

      const nomineesQuery = query(
        collection(db, "nominees"),
        where("userId", "==", auth.currentUser.uid)
      );
      const nomineesSnapshot = await getDocs(nomineesQuery);
      const nomineesData = nomineesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setAssets(assetsData);
      setNominees(nomineesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

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
setToast('Copy failed');
    }
  };

  const getTagColor = (tag) => {
    const colors = {
      'Finance': '#10b981', 'Banking': '#10b981',
      'Work': '#3b82f6',
      'Social': '#8b5cf6',
      // ... from TagInput
    };
    return colors[tag] || '#6366f1';
  };

  // Nominee handlers (unchanged)
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
      alert("Nominee updated successfully!");
    } catch (error) {
      alert("Error updating nominee: " + error.message);
    }
  };

  const handleDeleteNominee = async (nomineeId) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteDoc(doc(db, "nominees", nomineeId));
        fetchData();
        alert("Nominee deleted!");
      } catch (error) {
        alert("Error: " + error.message);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingNominee(null);
    setEditForm({ name: "", email: "", relationship: "", phone: "" });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Sidebar />
        <div style={styles.main}>
          <div style={{ textAlign: "center", padding: "50px" }}>
<div style={{ fontSize: "2rem", marginBottom: "20px" }}>Loading...</div>
            <p>Loading your digital legacy...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        {toast && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#10b981',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            {toast}
          </div>
        )}

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Your Digital Legacy</h1>
          <p style={styles.subtitle}>Securely view your assets • Credentials masked by default</p>
        </div>

        {/* Add Button */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <button
            style={styles.addButton}
            onClick={() => navigate("/new-add-asset")}
          >
            ➕ Add New Asset
          </button>
        </div>

        {/* Assets Section */}
        <div style={styles.section}>
<h2 style={styles.sectionTitle}>Your Assets ({assets.length})</h2>
          {assets.length === 0 ? (
            <div style={styles.emptyState}>
<div style={{ fontSize: "3rem", marginBottom: "20px" }}>No Assets</div>
              <p>No assets yet. Add your first secure asset.</p>
            </div>
          ) : (
            <div style={styles.assetsGrid}>
              {assets.map((asset) => {
                const isExpanded = asset.decryptedCredentials !== '[No Credentials]';
                const isShowingPassword = showPassword[asset.id];
                const category = asset.tags?.[0] || asset.category || 'other';
                const icon = 'Asset';

                return (
                  <div key={asset.id} style={styles.assetCard}>
                    <div style={styles.assetHeader} onClick={() => isExpanded && navigate(`/view-asset/${asset.id}`)}>
                      <span style={styles.categoryIcon}>{icon}</span>
                      <div>
                        <h3 style={styles.assetTitle}>{asset.title}</h3>
                        <div style={styles.assetTags}>
                          {asset.tags?.map((tag, idx) => (
                            <span key={idx} style={{
                              ...styles.tagChip,
                              backgroundColor: getTagColor(tag)
                            }}>
                              {tag}
                            </span>
                          ))}
                          {asset.category && !asset.tags && (
                            <span style={styles.tagChip}>{asset.category}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={styles.assetDetails}>
                        <div style={styles.detailRow}>
Identifier:
                          <span style={styles.detailValue}>
                            {asset.identifier || (asset.fields?.find(f => f.fieldName.toLowerCase().includes('identifier') || f.fieldName.toLowerCase().includes('username'))?.encryptedValue ? '[Encrypted Username]' : 'N/A')}
                          </span>
                        </div>

                        <div style={styles.passwordSection}>
                          <div style={styles.detailRow}>
Credentials:
                            <div style={{ flex: 1, position: 'relative' }}>
                              <span style={styles.detailValue} className="password-display">
                                {isShowingPassword 
                                  ? asset.decryptedCredentials 
                                  : '•'.repeat(asset.decryptedCredentials.length || 10)
                                }
                              </span>
                              <button
                                style={styles.passwordToggle}
                                onClick={() => togglePassword(asset.id)}
                                title={isShowingPassword ? 'Hide' : 'Show'}
                              >
                                {isShowingPassword ? 'Hide' : 'Show'}
                              </button>
                              <button
                                style={styles.copyButton}
                                onClick={() => copyCredentials(asset.decryptedCredentials)}
                                title="Copy to clipboard"
                              >
Copy
                              </button>
                            </div>
                          </div>
                        </div>

                        {asset.note && (
                          <div style={styles.detailRow}>
Note:
                            <span style={styles.detailValue}>{asset.note}</span>
                          </div>
                        )}

                        <div style={styles.assetMeta}>
                          <small>Added: {asset.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}</small>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Nominees & Summary sections unchanged */}
        {/* ... keep existing nominees code ... */}
        <div style={styles.section}>
<h2 style={styles.sectionTitle}>Your Nominees ({nominees.length})</h2>
          {/* existing nominees JSX */}
        </div>

        <div style={styles.summarySection}>
<h2 style={styles.sectionTitle}>Legacy Summary</h2>
          <div style={styles.summaryCard}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryNumber}>{assets.length}</span>
              <span style={styles.summaryLabel}>Digital Assets</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryNumber}>{nominees.length}</span>
              <span style={styles.summaryLabel}>Trusted Nominees</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryNumber}>{new Set(assets.flatMap(a => a.tags || [a.category])).size}</span>
              <span style={styles.summaryLabel}>Categories</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Existing styles + new
const styles = {
  // ... existing styles ...
  passwordSection: {
    margin: '16px 0',
    padding: '16px',
    background: 'rgba(239, 68, 68, 0.05)',
    borderRadius: '12px',
    borderLeft: '4px solid #ef4444'
  },
  passwordToggle: {
    marginLeft: '12px',
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#6366f1',
    border: 'none',
    padding: '4px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  copyButton: {
    marginLeft: '8px',
    background: 'rgba(16, 185, 129, 0.2)',
    color: '#10b981',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  assetTags: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '4px'
  },
  tagChip: {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'white'
  }
};

export default ViewAssets;