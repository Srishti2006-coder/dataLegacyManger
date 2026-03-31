import { useState, useEffect, useCallback } from "react";
import { auth, db, sendNomineeVerificationEmail } from "../services/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Nominee() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [nominees, setNominees] = useState([]);
  const [assets, setAssets] = useState([]);
const [formData, setFormData] = useState({
    name: "",
    email: "",
    relationship: "",
    phone: "",
    verified: false, // New: verification status
    verificationSent: false,
    assignedAssets: []
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchNominees = useCallback(async () => {
    try {
      const q = query(collection(db, "nominees"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const nomineesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNominees(nomineesData);
    } catch (error) {
      console.error("Error fetching nominees:", error);
      setError("Failed to load nominees. Please try again.");
    }
  }, [user]);

  const fetchAssets = useCallback(async () => {
    try {
      const q = query(collection(db, "assets"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const assetsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssets(assetsData);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setError("Failed to load assets. Please try again.");
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNominees();
      fetchAssets();
    }
  }, [user, fetchNominees, fetchAssets]); // user is the only external dependency

  const getNomineeAssets = (nomineeId) => {
    const nominee = nominees.find(n => n.id === nomineeId);
    if (!nominee || !nominee.assignedAssets || !Array.isArray(nominee.assignedAssets)) {
      return [];
    }
    return assets.filter(asset => nominee.assignedAssets.includes(asset.id));
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
if (!formData.name || !formData.relationship) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (editingId) {
        // Update existing nominee
        await updateDoc(doc(db, "nominees", editingId), {
          ...formData,
          updatedAt: new Date()
        });
        setSuccess("Nominee updated successfully!");
        setEditingId(null);
      } else {
        // Add new nominee
        await addDoc(collection(db, "nominees"), {
          ...formData,
          userId: user.uid,
          createdAt: new Date()
        });
        setSuccess("Nominee added successfully!");
      }
      setFormData({ name: "", email: "", relationship: "", phone: "", assignedAssets: [] });
      fetchNominees();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (nominee) => {
    setFormData({
      name: nominee.name,
      email: nominee.email,
      relationship: nominee.relationship,
      phone: nominee.phone || "",
      verified: nominee.verified || false,
      verificationSent: nominee.verificationSent || false,
      assignedAssets: nominee.assignedAssets || []
    });
    setEditingId(nominee.id);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setFormData({ name: "", email: "", relationship: "", phone: "", assignedAssets: [] });
    setEditingId(null);
    setError("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this nominee? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "nominees", id));
        fetchNominees();
        setSuccess("Nominee deleted successfully!");
      } catch (error) {
        setError("Error deleting nominee: " + error.message);
      }
    }
  };

  return (
    <div style={{ display: "flex", background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)", minHeight: "100vh", color: "white" }}>
      <div style={{ width: "240px", background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)", color: "white", padding: "20px", position: "fixed", left: 0, top: 0, height: "100vh", boxShadow: "2px 0 10px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: "40px", fontSize: "24px", fontWeight: "bold", color: "#6366f1" }}>LegacyAI</h2>
        <button style={{ background: "rgba(51, 65, 85, 0.5)", border: "1px solid #475569", borderRadius: "12px", color: "white", padding: "15px 20px", marginBottom: "10px", cursor: "pointer", width: "100%", transition: "all 0.3s ease" }} onClick={() => navigate("/dashboard")}>Dashboard</button>
        <button style={{ background: "rgba(51, 65, 85, 0.5)", border: "1px solid #475569", borderRadius: "12px", color: "white", padding: "15px 20px", marginBottom: "10px", cursor: "pointer", width: "100%", transition: "all 0.3s ease" }} onClick={() => navigate("/add-asset")}>Add Asset</button>
        <button style={{ background: "rgba(51, 65, 85, 0.5)", border: "1px solid #475569", borderRadius: "12px", color: "white", padding: "15px 20px", marginBottom: "10px", cursor: "pointer", width: "100%", transition: "all 0.3s ease" }} onClick={() => navigate("/view-assets")}>View Assets</button>
        <button style={{ background: "rgba(99, 102, 241, 0.3)", border: "1px solid #6366f1", borderRadius: "12px", color: "white", padding: "15px 20px", marginBottom: "10px", cursor: "pointer", width: "100%", transition: "all 0.3s ease" }} onClick={() => navigate("/nominee")}>Nominee</button>
        <button style={{ background: "rgba(51, 65, 85, 0.5)", border: "1px solid #475569", borderRadius: "12px", color: "white", padding: "15px 20px", marginBottom: "10px", cursor: "pointer", width: "100%", transition: "all 0.3s ease" }} onClick={() => navigate("/profile")}>Profile</button>
        <button style={{ background: "rgba(51, 65, 85, 0.5)", border: "1px solid #475569", borderRadius: "12px", color: "white", padding: "15px 20px", marginBottom: "10px", cursor: "pointer", width: "100%", transition: "all 0.3s ease" }} onClick={() => navigate("/settings")}>Settings</button>
      </div>

      <div style={{ marginLeft: "260px", padding: "40px", width: "100%" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "10px", textAlign: "center", textShadow: "0 0 20px rgba(99, 102, 241, 0.5)" }}>Manage Nominees</h1>
          <p style={{ color: "#94a3b8", textAlign: "center", marginBottom: "40px", fontSize: "1.1rem" }}>Designate trusted individuals to access your digital legacy</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start" }}>
            {/* Add/Edit Nominee Form */}
            <div style={{ background: "linear-gradient(145deg, #1e293b, #334155)", borderRadius: "20px", padding: "30px", border: "1px solid #475569", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
              <h3 style={{ marginBottom: "20px", color: "white", textAlign: "center" }}>{editingId ? "Edit Nominee" : "Add New Nominee"}</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1", fontWeight: "500" }}>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "2px solid #475569", background: "#1a1a2e", color: "white", fontSize: "16px", transition: "border-color 0.3s ease" }}
                    required
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1", fontWeight: "500" }}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address (required for verification)"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "2px solid #475569", background: "#1a1a2e", color: "white", fontSize: "16px", transition: "border-color 0.3s ease" }}
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1", fontWeight: "500" }}>Relationship *</label>
                  <input
                    type="text"
                    name="relationship"
                    placeholder="e.g., Family Member, Trusted Friend"
                    value={formData.relationship}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "2px solid #475569", background: "#1a1a2e", color: "white", fontSize: "16px", transition: "border-color 0.3s ease" }}
                    required
                  />
                </div>
    <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1", fontWeight: "500" }}>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number (optional)"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "2px solid #475569", background: "#1a1a2e", color: "white", fontSize: "16px", transition: "border-color 0.3s ease" }}
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1", fontWeight: "500" }}>Verified</label>
                  <input
                    type="checkbox"
                    name="verified"
                    checked={formData.verified}
                    onChange={(e) => setFormData({...formData, verified: e.target.checked})}
                    style={{ width: "20px", height: "20px", accentColor: "#10b981", marginTop: "5px" }}
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "10px", color: "#cbd5e1", fontWeight: "500" }}>Assign Assets</label>
                  <div style={{ maxHeight: "200px", overflowY: "auto", padding: "10px", background: "#1a1a2e", borderRadius: "8px", border: "1px solid #475569" }}>
                    {assets.length === 0 ? (
                      <p style={{ color: "#94a3b8", fontSize: "0.9rem", textAlign: "center", margin: "20px 0" }}>No assets available. Add assets first to assign them to nominees.</p>
                    ) : (
                      assets.map((asset) => (
                        <div key={asset.id} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                          <input
                            type="checkbox"
                            id={`asset-${asset.id}`}
                            checked={formData.assignedAssets.includes(asset.id)}
                            onChange={(e) => {
                              const assetId = asset.id;
                              setFormData(prev => ({
                                ...prev,
                                assignedAssets: e.target.checked
                                  ? [...prev.assignedAssets, assetId]
                                  : prev.assignedAssets.filter(id => id !== assetId)
                              }));
                            }}
                            style={{ marginRight: "10px", accentColor: "#6366f1" }}
                          />
                          <label htmlFor={`asset-${asset.id}`} style={{ color: "#cbd5e1", fontSize: "0.9rem", cursor: "pointer" }}>
                            <strong>{asset.title}</strong> ({asset.category}) - {asset.notes || 'No description'}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <p style={{ color: "#6b7280", fontSize: "0.8rem", marginTop: "5px" }}>
                    Select the assets this nominee should have access to. You can change this later.
                  </p>
                </div>
                {success && <p style={{ color: "#10b981", marginBottom: "15px", fontSize: "14px" }}>{success}</p>}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ flex: 1, padding: "12px", background: "linear-gradient(45deg, #6366f1, #8b5cf6)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", transition: "transform 0.3s ease" }}
                  >
                    {loading ? "Saving..." : editingId ? "Update Nominee" : "Add Nominee"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      style={{ padding: "12px 20px", background: "#6b7280", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px" }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Nominees List */}
            <div style={{ background: "linear-gradient(145deg, #1e293b, #334155)", borderRadius: "20px", padding: "30px", border: "1px solid #475569", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
              <h3 style={{ marginBottom: "20px", color: "white", textAlign: "center" }}>Your Nominees ({nominees.length})</h3>
              {nominees.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>

                  <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>No nominees added yet.</p>
                  <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: "10px" }}>Add trusted individuals who can access your digital assets in case of emergency.</p>
                </div>
              ) : (
                <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                  {nominees.map((nominee) => (
                    <div key={nominee.id} style={{ background: "#2a2a3e", padding: "20px", borderRadius: "12px", marginBottom: "15px", border: "1px solid #475569", position: "relative" }}>
                      <h4 style={{ margin: "0 0 8px 0", color: "white", fontSize: "1.2rem" }}>{nominee.name}</h4>
{nominee.email && <p style={{ margin: "0 0 5px 0", color: "#94a3b8", fontSize: "0.9rem" }}>{nominee.email}</p>}
<p style={{ margin: "0 0 5px 0", color: "#94a3b8", fontSize: "0.9rem" }}>{nominee.relationship}</p>
{nominee.phone && <p style={{ margin: "0 0 15px 0", color: "#94a3b8", fontSize: "0.9rem" }}>{nominee.phone}</p>}
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                        <span style={{ color: nominee.verified ? "#10b981" : "#ef4444", fontSize: "1.2rem", marginRight: "8px" }}>
                          {nominee.verified ? "✓" : "✗"}
                        </span>

                        <span style={{ fontWeight: "500" }}>
                          {nominee.verified ? "Verified" : "Not Verified"}
                          {nominee.verificationSent && !nominee.verified && " (Email Sent)"}
                        </span>
                      </div>
                      <div style={{ marginBottom: "15px", padding: "10px", background: "#1a1a2e", borderRadius: "8px" }}>
                        <p style={{ fontWeight: "bold", color: "#6366f1", marginBottom: "8px", fontSize: "0.9rem" }}>
                          Assigned Assets ({getNomineeAssets(nominee.id).length})
                        </p>

                        {getNomineeAssets(nominee.id).length === 0 ? (
                          <p style={{ color: "#94a3b8", fontSize: "0.8rem" }}>No assets assigned yet</p>
                        ) : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                            {getNomineeAssets(nominee.id).map((asset) => (
                              <span key={asset.id} style={{
                                background: "#475569",
                                padding: "4px 8px",
                                borderRadius: "12px",
                                fontSize: "0.8rem",
                                color: "#e2e8f0"
                              }}>
                                {asset.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => handleEdit(nominee)}
                          style={{ padding: "8px 15px", background: "#f59e0b", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", transition: "background 0.3s ease" }}
                        >
                          Edit
                        </button>

                        {!nominee.verified && (
                          <button
                            onClick={async () => {
                              try {
                                setError("");
                                setSuccess("");
                                const result = await sendNomineeVerificationEmail({ nomineeId: nominee.id });
                                setSuccess(result.data.message || "Verification email sent!");
                                fetchNominees();
                              } catch (error) {
                                console.error("Send verification error:", error);
                                setError(error.message || "Failed to send verification email.");
                              }
                            }}
                            disabled={nominee.verificationSent}
                            style={{ 
                              padding: "8px 15px", 
                              background: nominee.verificationSent ? "#6b7280" : "#3b82f6", 
                              color: "white", 
                              border: "none", 
                              borderRadius: "6px", 
                              cursor: nominee.verificationSent ? "not-allowed" : "pointer", 
                              fontSize: "14px", 
                              transition: "all 0.3s ease",
                              opacity: nominee.verificationSent ? 0.6 : 1
                            }}
                          >
                            {nominee.verificationSent ? "Email Sent" : "Send Verification"}
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            try {
                              await addDoc(collection(db, "accessRequests"), {
                                nomineeId: nominee.id,
                                nomineeName: nominee.name,
                                nomineeEmail: nominee.email,
                                userId: user.uid,
                                status: "pending",
                                requestedAt: new Date(),
                                requestedByNominee: true
                              });
                              setSuccess("Emergency access requested! Check your notifications.");
                            } catch (error) {
                              setError("Failed to request access: " + error.message);
                            }
                          }}
                          style={{ padding: "8px 15px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", transition: "background 0.3s ease" }}
                        >
                           Request Emergency Access
                        </button>
                        <button
                          onClick={() => handleDelete(nominee.id)}
                          style={{ padding: "8px 15px", background: "#6b7280", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", transition: "background 0.3s ease" }}
                        >
                           Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Nominee;