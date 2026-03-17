import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { collection, addDoc, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Sidebar from "../layout/Sidebar";

function EmergencyAccess() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [requests, setRequests] = useState([]);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const q = query(
      collection(db, "accessRequests"),
      where("userId", "==", user.uid),
      orderBy("requestedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const handleRequestAccess = async () => {
    try {
      await addDoc(collection(db, "accessRequests"), {
        nomineeId: "demo-nominee",
        nomineeName: "Trusted Nominee",
        nomineeEmail: "nominee@example.com",
        userId: user.uid,
        status: "pending",
        requestedAt: new Date(),
        otp: "123456",
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });
      setSuccess("Access request sent! Waiting for user approval.");
      setError("");
    } catch (err) {
      setError("Failed to request access");
      setSuccess("");
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      if (otp === "123456") {
        setCurrentRequest({
          assets: ["asset1", "asset2"],
          accessUntil: new Date(Date.now() + 60 * 60 * 1000)
        });
        setShowOtpForm(false);
        setSuccess("Access granted! You have temporary vault access.");
        setError("");
      } else {
        setError("Invalid OTP");
        setSuccess("");
      }
    } catch (err) {
      setError("OTP verification failed");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)", minHeight: "100vh", color: "white" }}>
      <Sidebar />
      <div style={{ marginLeft: "260px", padding: "40px", width: "100%" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "10px", textAlign: "center", textShadow: "0 0 20px rgba(239, 68, 68, 0.5)" }}>
            🚨 Emergency Access
          </h1>
          <p style={{ color: "#94a3b8", textAlign: "center", marginBottom: "40px", fontSize: "1.1rem" }}>
            Request temporary access to the owner's vault. OTP required for verification.
          </p>

          {success && (
            <div style={{ background: "rgba(34, 197, 94, 0.2)", border: "1px solid #22c55e", borderRadius: "12px", padding: "20px", marginBottom: "30px", color: "#22c55e" }}>
              {success}
            </div>
          )}

          {error && (
            <div style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
              {error}
            </div>
          )}

          {requests.length === 0 && !showOtpForm && (
            <div style={{ textAlign: "center", padding: "60px 40px" }}>
              <div style={{ fontSize: "4rem", marginBottom: "30px", color: "#94a3b8" }}>🚨</div>
              <h3 style={{ color: "#94a3b8", marginBottom: "20px" }}>...</h3>
              <p style={{ color: "#6b7280", marginBottom: "30px" }}>...</p>
              <button
                onClick={handleRequestAccess}
                style={{
                  padding: "18px 50px",
                  background: "linear-gradient(45deg, #ef4444, #dc2626)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                📤 Send Access Request
              </button>
            </div>
          )}

          {showOtpForm && (
            <div style={{ maxWidth: "500px", margin: "0 auto", background: "linear-gradient(145deg, #1e293b, #334155)", borderRadius: "20px", padding: "40px", border: "1px solid #475569" }}>
              <h3 style={{ marginBottom: "20px", textAlign: "center" }}>Enter OTP</h3>
              <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "30px" }}>
                Check your email/phone for 6-digit OTP. You have 10 minutes.
              </p>
              <div style={{ marginBottom: "25px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#cbd5e1" }}>...</label>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  style={{
                    width: "100%",
                    padding: "15px",
                    borderRadius: "10px",
                    border: "2px solid #475569",
                    background: "#1a1a2e",
                    color: "white",
                    fontSize: "18px",
                    letterSpacing: "6px",
                    textAlign: "center",
                    fontFamily: "monospace"
                  }}
                />
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: otp.length === 6 ? "linear-gradient(45deg, #10b981, #059669)" : "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: otp.length === 6 ? "pointer" : "not-allowed"
                }}
              >
                {loading ? "Verifying..." : "Verify OTP & Grant Access"}
              </button>
            </div>
          )}

          {currentRequest && (
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <div style={{ fontSize: "4rem", color: "#10b981" }}>...</div>
                <h2 style={{ marginBottom: "10px" }}>...</h2>
                <p>Access expires: {currentRequest.accessUntil.toLocaleString()}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
                {currentRequest.assets.map((assetId, index) => (
                  <div key={index} style={{
                    background: "#2a2a3e",
                    padding: "25px",
                    borderRadius: "16px",
                    borderLeft: "4px solid #10b981"
                  }}>
                    <h4 style={{ color: "white", marginBottom: "15px" }}>...</h4>
                    <p style={{ color: "#94a3b8" }}>...</p>
                    <div style={{ marginTop: "15px", padding: "15px", background: "#1a1a2e", borderRadius: "8px", fontSize: "14px" }}>
                      Demo: View decrypted data here (full impl shows actual assets)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {requests.length > 0 && !showOtpForm && !currentRequest && (
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <h3 style={{ marginBottom: "25px" }}>...</h3>
              {requests.slice(0, 5).map((req) => (
                <div key={req.id} style={{
                  background: "#2a2a3e",
                  padding: "20px",
                  borderRadius: "12px",
                  marginBottom: "15px",
                  borderLeft: "4px solid #3b82f6"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontWeight: "bold", color: "white" }}>...</span>
                    <span style={{ fontSize: "0.9rem", color: req.status === "approved" ? "#10b981" : "#94a3b8" }}>
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ color: "#94a3b8", marginBottom: "10px" }}>...</p>
                  <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    Requested: {req.requestedAt.toDate().toLocaleString()}
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowOtpForm(true)}
                style={{
                  display: "block",
                  margin: "30px auto 0",
                  padding: "15px 40px",
                  background: "linear-gradient(45deg, #3b82f6, #1d4ed8)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  cursor: "pointer"
                }}
              >
                🔑 Enter OTP for Pending Request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmergencyAccess;
