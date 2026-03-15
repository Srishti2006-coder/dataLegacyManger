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
        console.error("Error fetching assets:", err);
        setError("Failed to load vault");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, navigate]);

  const getCategoryIcon = (category) => {
    const icons = {
      password: "🔐",
      email: "📧",
      financial: "🏦",
      crypto: "₿",
      social: "📱",
      cloud: "☁️",
      streaming: "🎬",
      shopping: "🛒",
      // Add more as needed
    };
    return icons[category] || "📦";
  };

  if (loading) return <div style={{ padding: "40px", marginLeft: "260px", color: "white" }}>Loading vault...</div>;

  return (
    <div style={{ display: "flex", background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)", minHeight: "100vh", color: "white" }}>
      <Sidebar />
      <div style={{ marginLeft: "260px", padding: "40px", width: "100%" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "10px", textAlign: "center", textShadow: "0 0 20px rgba(99, 102, 241, 0.5)" }}>
            🔐 Secure Vault
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
              <div style={{ fontSize: "4rem", marginBottom: "20px", color: "#94a3b8" }}>🔐</div>
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
                ➕ Add First Asset
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
              {assets.map((asset) => {
                const decryptedPassword = decryptField(asset.encryptedPassword, user.email);
                const decryptedNotes = decryptField(asset.encryptedNotes, user.email);

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
                      <div>
                        <h3 style={{ margin: "0 0 5px 0", color: "white", fontSize: "1.3rem" }}>
                          {asset.title}
                        </h3>
                        <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>
                          {asset.username || "No username"}
                        </p>
                      </div>
                    </div>

                    {decryptedPassword !== '[Decryption Failed]' && (
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
                          {decryptedPassword}
                        </div>
                      </div>
                    )}

                    {decryptedNotes !== '[Decryption Failed]' && decryptedNotes && (
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1", fontWeight: "500", fontSize: "0.9rem" }}>Notes</label>
                        <div style={{
                          background: "#1a1a2e",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid #475569",
                          color: "#e2e8f0",
                          fontSize: "14px",
                          lineHeight: "1.5"
                        }}>
                          {decryptedNotes}
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
        </div>
      </div>
    </div>
  );
}

export default Vault;
