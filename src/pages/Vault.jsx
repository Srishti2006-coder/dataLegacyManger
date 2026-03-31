import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { decryptField } from "../services/encryption";
import Sidebar from "../layout/Sidebar";

function Vault() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState({});
  const [hideSensitive, setHideSensitive] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('datalegacy-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setHideSensitive(parsed.hideSensitive || false);
    }
  }, []);

  // toast state removed - no longer used

  const styles = {
    passwordSection: {
      margin: '16px 0',
      padding: '16px',
      background: 'rgba(239, 68, 68, 0.05)',
      borderRadius: '12px',
      borderLeft: '4px solid #ef4444'
    },
    passwordToggle: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'rgba(99, 102, 241, 0.2)',
      color: '#6366f1',
      border: 'none',
      padding: '4px 8px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '1.1rem'
    },
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const q = query(
      collection(db, "assets"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const assetsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAssets(assetsData);
        setLoading(false);
      },
      (err) => {
        setError("Failed to load vault");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, navigate]);

  const togglePassword = (assetId) => {
    setShowPassword(prev => ({
      ...prev,
      [assetId]: !(prev[assetId] ?? !hideSensitive)
    }));
  };





  const getDecryptedCredentials = (asset) => {
    const userEmail = user?.email || '';
    if (asset.encryptedCredentials) {
      return decryptField(asset.encryptedCredentials, userEmail);
    } else if (asset.fields) {
      const passwordField = asset.fields.find(f => 
        f.fieldName.toLowerCase().includes('password') || 
        f.fieldName.toLowerCase().includes('credentials')
      );
      return passwordField ? decryptField(passwordField.encryptedValue, userEmail) : '[No Credentials]';
    }
    return '[No Credentials]';
  };



  const getCategoryIcon = (category) => {
    const icons = {
      "email": "E",
      "password": "P",
      "bank": "B",
      "crypto": "C",
      "social": "S",
      "document": "D"
    };
    return icons[category] || "";
  };


  if (loading) return <div style={{ padding: "40px", marginLeft: "260px", color: "white" }}>Loading vault...</div>;

  return (
    <div style={{ display: "flex", background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)", minHeight: "100vh", color: "white" }}>
      <Sidebar />
      <div style={{ marginLeft: "260px", padding: "40px", width: "100%" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "10px", textAlign: "center", textShadow: "0 0 20px rgba(99, 102, 241, 0.5)" }}>
            Secure Vault
          </h1>
          <p style={{ color: "#94a3b8", textAlign: "center", marginBottom: "40px", fontSize: "1.1rem" }}>
            Your encrypted digital legacy. All sensitive data is client-side decrypted.
          </p>


          {error && (
            <div style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", borderRadius: "12px", padding: "20px", marginBottom: "30px", color: "#ef4444" }}>
              {error}
            </div>
          )}

          {assets.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: "4rem", marginBottom: "20px", color: "#94a3b8" }}></div>
              <h3 style={{ color: "#94a3b8", marginBottom: "10px" }}>Your vault is empty</h3>

              <p style={{ color: "#6b7280", fontSize: "1rem" }}>Add your first digital asset to get started.</p>
              <button
                onClick={() => navigate("/add-asset")}
                style={{
                  marginTop: "20px",
                  padding: "15px 30px",
                  background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "transform 0.3s ease"
                }}
              >
                + Add First Asset
              </button>

            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
              {assets.map((asset) => {
                const decryptedCredentials = getDecryptedCredentials(asset);

                const isShowing = showPassword[asset.id] ?? !hideSensitive;
                const masked = decryptedCredentials.length > 0 ? '•'.repeat(Math.max(decryptedCredentials.length, 8)) : '[No Credentials]'; 

                return (
                  <div key={asset.id} style={{
                    background: "linear-gradient(145deg, #1e293b, #334155)",
                    borderRadius: "16px",
                    padding: "25px",
                    border: "1px solid #475569",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(99, 102, 241, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
                  }}
                  >
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                      <span style={{ fontSize: "1.5rem", marginRight: "12px" }}>
                        {getCategoryIcon(asset.category)}
                      </span>
                      <div style={styles.passwordSection}>
                        <label style={{ display: "block", marginBottom: "8px", color: "#cbd5e1", fontWeight: "500" }}>Credentials</label>

                        <div style={{ position: 'relative' }}>
                          <span style={{
                            background: "#1a1a2e",
                            padding: "12px 16px",
                            borderRadius: "8px",
                            border: "1px solid #475569",
                            fontFamily: "monospace",
                            fontSize: "14px",
                            color: "#e2e8f0",
                            wordBreak: "break-all",
                            display: 'block'
                          }}>
                            {isShowing ? decryptedCredentials : masked}
                          </span>
                          <button
                            style={styles.passwordToggle}
                            onClick={() => togglePassword(asset.id)}
                            title={isShowing ? 'Hide' : 'Show'}
                          >
                            {isShowing ? 'H' : 'S'}
                          </button>
                        </div>

                      </div>
                      <div>
                        <h3 style={{ margin: "0 0 5px 0", color: "white", fontSize: "1.3rem" }}>
                          {asset.title}
                        </h3>
                        <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>
                          {asset.username || "No username"}
                        </p>
                      </div>
                    </div>

                    {decryptedCredentials !== '[Decryption Failed]' && decryptedCredentials !== '[No Credentials]' && (
                      <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1", fontWeight: "500", fontSize: "0.9rem" }}>Password</label>
                        <div style={{
                          background: "#1a1a2e",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid #475569",
                          fontFamily: "monospace",
                          fontSize: "14px",
                          color: "#10b981",
                          wordBreak: "break-all"
                        }}>
                          {decryptedCredentials}
                        </div>
                      </div>
                    )}



                    <div style={{ marginTop: "20px", fontSize: "0.8rem", color: "#64748b" }}>
                      Category: <span style={{ color: "#6366f1" }}>{asset.category}</span> | 
                      Added: {asset.createdAt?.toDate ? asset.createdAt.toDate().toLocaleDateString() : 'Recent'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* Toast removed - no longer used */}
        </div>
      </div>
    </div>
  );
}

export default Vault;
