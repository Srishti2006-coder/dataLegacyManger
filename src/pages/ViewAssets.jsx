import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import Sidebar from "../layout/Sidebar";
import { useNavigate } from "react-router-dom";

function ViewAssets() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNominee, setEditingNominee] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", relationship: "", phone: "" });

  const categories = [
    { value: "password", label: "Password/Credentials", icon: "🔐" },
    { value: "email", label: "Email Accounts", icon: "📧" },
    { value: "financial", label: "Banking & Finance", icon: "🏦" },
    { value: "crypto", label: "Cryptocurrency & Wallets", icon: "₿" },
    { value: "social", label: "Social Media", icon: "📱" },
    { value: "cloud", label: "Cloud Storage", icon: "☁️" },
    { value: "streaming", label: "Streaming Services", icon: "🎬" },
    { value: "shopping", label: "Shopping & Retail", icon: "🛒" },
    { value: "professional", label: "Professional & Work", icon: "💼" },
    { value: "health", label: "Health & Medical", icon: "🏥" },
    { value: "government", label: "Government & Tax", icon: "🏛️" },
    { value: "gaming", label: "Gaming Accounts", icon: "🎮" },
    { value: "communication", label: "Communication", icon: "💬" },
    { value: "security", label: "Security & 2FA", icon: "🛡️" },
    { value: "insurance", label: "Insurance", icon: "📋" },
    { value: "real-estate", label: "Real Estate", icon: "🏠" },
    { value: "education", label: "Education", icon: "🎓" },
    { value: "travel", label: "Travel & Loyalty", icon: "✈️" },
    { value: "utilities", label: "Utilities", icon: "⚡" },
    { value: "subscriptions", label: "Subscriptions", icon: "📺" },
    { value: "personal", label: "Personal Documents", icon: "📄" },
    { value: "other", label: "Other", icon: "📦" }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      // Fetch assets
      const assetsQuery = query(
        collection(db, "assets"),
        where("userId", "==", auth.currentUser.uid)
      );
      const assetsSnapshot = await getDocs(assetsQuery);
      const assetsData = assetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch nominees
      const nomineesQuery = query(
        collection(db, "nominees"),
        where("userId", "==", auth.currentUser.uid)
      );
      const nomineesSnapshot = await getDocs(nomineesQuery);
      const nomineesData = nomineesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log("Loaded assets:", assetsData);
      console.log("Loaded nominees:", nomineesData);

      setAssets(assetsData);
      setNominees(nomineesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || categories.find(cat => cat.value === "other");
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
      fetchData(); // Refresh data
      alert("Nominee updated successfully!");
    } catch (error) {
      alert("Error updating nominee: " + error.message);
    }
  };

  const handleDeleteNominee = async (nomineeId) => {
    if (window.confirm("Are you sure you want to delete this nominee?")) {
      try {
        await deleteDoc(doc(db, "nominees", nomineeId));
        fetchData(); // Refresh data
        alert("Nominee deleted successfully!");
      } catch (error) {
        alert("Error deleting nominee: " + error.message);
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
            <div style={{ fontSize: "2rem", marginBottom: "20px" }}>⏳</div>
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
        <div style={styles.header}>
          <h1 style={styles.title}>Your Digital Legacy</h1>
          <p style={styles.subtitle}>All your important information in one secure place</p>
        </div>

        {/* User Information Section */}
        <div style={styles.userSection}>
          <h2 style={styles.sectionTitle}>👤 Owner Information</h2>
          <div style={styles.userCard}>
            <div style={styles.userInfo}>
              <h3>Srishti's Digital Assets</h3>
              <p>Email: {auth.currentUser?.email}</p>
              <p>Assets: {assets.length} | Nominees: {nominees.length}</p>
            </div>
          </div>
        </div>

        {/* Assets Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📁 Your Assets ({assets.length})</h2>
          {assets.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: "3rem", marginBottom: "20px" }}>📦</div>
              <p>No assets added yet.</p>
              <button
                style={styles.addButton}
                onClick={() => navigate("/add-asset")}
              >
                Add Your First Asset
              </button>
            </div>
          ) : (
            <div style={styles.assetsGrid}>
              {assets.map((asset) => {
                const categoryInfo = getCategoryInfo(asset.category);
                return (
                  <div key={asset.id} style={styles.assetCard}>
                    <div style={styles.assetHeader}>
                      <span style={styles.categoryIcon}>{categoryInfo.icon}</span>
                      <h3 style={styles.assetTitle}>{asset.title}</h3>
                    </div>
                    <div style={styles.assetCategory}>
                      {categoryInfo.label}
                    </div>
                    <div style={styles.assetDetails}>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>👤 Username:</span>
                        <span style={styles.detailValue}>{asset.username}</span>
                      </div>
                      {asset.password && (
                        <div style={styles.detailRow}>
                          <span style={styles.detailLabel}>🔑 Password/Info:</span>
                          <span style={styles.detailValue}>{asset.password}</span>
                        </div>
                      )}
                      {asset.notes && (
                        <div style={styles.detailRow}>
                          <span style={styles.detailLabel}>📝 Notes:</span>
                          <span style={styles.detailValue}>{asset.notes}</span>
                        </div>
                      )}
                    </div>
                    <div style={styles.assetMeta}>
                      <small>Added: {asset.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Nominees Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>👥 Your Nominees ({nominees.length})</h2>
          {nominees.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: "3rem", marginBottom: "20px" }}>👤</div>
              <p>No nominees added yet.</p>
              <button
                style={styles.addButton}
                onClick={() => navigate("/nominee")}
              >
                Add Trusted Nominees
              </button>
            </div>
          ) : (
            <div style={styles.nomineesGrid}>
              {nominees.map((nominee) => (
                <div key={nominee.id} style={styles.nomineeCard}>
                  {editingNominee === nominee.id ? (
                    // Edit Mode
                    <div style={styles.editForm}>
                      <h4>Edit Nominee</h4>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        style={styles.editInput}
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        style={styles.editInput}
                      />
                      <input
                        type="text"
                        placeholder="Relationship"
                        value={editForm.relationship}
                        onChange={(e) => setEditForm({...editForm, relationship: e.target.value})}
                        style={styles.editInput}
                      />
                      <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        style={styles.editInput}
                      />
                      <div style={styles.editButtons}>
                        <button onClick={handleUpdateNominee} style={styles.saveButton}>Save</button>
                        <button onClick={handleCancelEdit} style={styles.cancelButton}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div style={styles.nomineeHeader}>
                        <h3>{nominee.name}</h3>
                        <div style={styles.nomineeActions}>
                          <button
                            onClick={() => handleEditNominee(nominee)}
                            style={styles.editButton}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteNominee(nominee.id)}
                            style={styles.deleteButton}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                      <div style={styles.nomineeDetails}>
                        <p>📧 {nominee.email}</p>
                        <p>👨‍👩‍👧‍👦 {nominee.relationship}</p>
                        {nominee.phone && <p>📞 {nominee.phone}</p>}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div style={styles.summarySection}>
          <h2 style={styles.sectionTitle}>📊 Legacy Summary</h2>
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
              <span style={styles.summaryNumber}>
                {new Set(assets.map(a => a.category)).size}
              </span>
              <span style={styles.summaryLabel}>Categories</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
    minHeight: "100vh",
    color: "white"
  },
  main: {
    marginLeft: "260px",
    padding: "40px",
    width: "100%"
  },
  header: {
    textAlign: "center",
    marginBottom: "40px"
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "10px",
    textShadow: "0 0 20px rgba(99, 102, 241, 0.5)"
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "1.1rem"
  },
  userSection: {
    marginBottom: "40px"
  },
  sectionTitle: {
    fontSize: "1.8rem",
    marginBottom: "20px",
    color: "#6366f1",
    borderBottom: "2px solid #6366f1",
    paddingBottom: "10px"
  },
  userCard: {
    background: "linear-gradient(145deg, #1e293b, #334155)",
    borderRadius: "15px",
    padding: "25px",
    border: "1px solid #475569",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
  },
  userInfo: {
    textAlign: "center"
  },
  section: {
    marginBottom: "40px"
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "linear-gradient(145deg, #1e293b, #334155)",
    borderRadius: "15px",
    border: "1px solid #475569"
  },
  addButton: {
    background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
    color: "white",
    border: "none",
    padding: "12px 25px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "20px",
    transition: "transform 0.3s ease"
  },
  assetsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "20px"
  },
  assetCard: {
    background: "linear-gradient(145deg, #1e293b, #334155)",
    borderRadius: "15px",
    padding: "25px",
    border: "1px solid #475569",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    transition: "transform 0.3s ease"
  },
  assetHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px"
  },
  categoryIcon: {
    fontSize: "24px",
    marginRight: "10px"
  },
  assetTitle: {
    fontSize: "1.4rem",
    margin: 0,
    color: "#6366f1"
  },
  assetCategory: {
    background: "#475569",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "0.9rem",
    display: "inline-block",
    marginBottom: "20px"
  },
  assetDetails: {
    marginBottom: "15px"
  },
  detailRow: {
    display: "flex",
    marginBottom: "8px",
    alignItems: "flex-start"
  },
  detailLabel: {
    minWidth: "120px",
    fontWeight: "bold",
    color: "#cbd5e1",
    fontSize: "0.9rem"
  },
  detailValue: {
    flex: 1,
    color: "#e2e8f0",
    wordBreak: "break-word"
  },
  assetMeta: {
    borderTop: "1px solid #475569",
    paddingTop: "10px",
    textAlign: "right"
  },
  nomineesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "20px"
  },
  nomineeCard: {
    background: "linear-gradient(145deg, #1e293b, #334155)",
    borderRadius: "15px",
    padding: "25px",
    border: "1px solid #475569",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
  },
  nomineeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px"
  },
  nomineeActions: {
    display: "flex",
    gap: "10px"
  },
  editButton: {
    background: "#f59e0b",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px"
  },
  deleteButton: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px"
  },
  nomineeDetails: {
    color: "#e2e8f0"
  },
  editForm: {
    textAlign: "center"
  },
  editInput: {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
    borderRadius: "6px",
    border: "1px solid #475569",
    background: "#1a1a2e",
    color: "white",
    fontSize: "14px"
  },
  editButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "15px"
  },
  saveButton: {
    flex: 1,
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  cancelButton: {
    flex: 1,
    background: "#6b7280",
    color: "white",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  summarySection: {
    marginTop: "50px"
  },
  summaryCard: {
    background: "linear-gradient(145deg, #1e293b, #334155)",
    borderRadius: "15px",
    padding: "30px",
    border: "1px solid #475569",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    display: "flex",
    justifyContent: "space-around",
    textAlign: "center"
  },
  summaryItem: {
    display: "flex",
    flexDirection: "column"
  },
  summaryNumber: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#6366f1"
  },
  summaryLabel: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    marginTop: "5px"
  }
};

export default ViewAssets;