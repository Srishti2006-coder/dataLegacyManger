

import { useEffect, useState, onAuthStateChanged } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth, verifyNomineeToken } from "../services/firebase";

function NomineeVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const token = searchParams.get("token");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setError("No verification token found.");
      return;
    }

    if (!user) {
      // Require Google login first
      navigate("/login?redirect=nominee-verify&token=" + encodeURIComponent(token), { replace: true });
      return;
    }

    const verifyNominee = async () => {
      try {
        const result = await verifyNomineeToken({ token });
        setStatus("success");
      } catch (err) {
        console.error("Verification failed:", err);
        setError(err.message || "Verification failed. Token may be invalid or expired.");
        setStatus("error");
      }
    };

    verifyNominee();
  }, [token, user, navigate]);

  const getStatusUI = () => {
    switch (status) {
      case "verifying":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "white", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🔍</div>
            <h2>Verifying your identity...</h2>
            <p>Please wait while we confirm your nominee status.</p>
          </div>
        );
      case "success":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "white", textAlign: "center" }}>
            <div style={{ fontSize: "4rem", marginBottom: "20px", color: "#10b981" }}>✅</div>
            <h2>Verification Successful!</h2>
            <p style={{ marginBottom: "30px" }}>Your identity has been verified via Google login. You are now an authorized nominee.</p>
            <button
              onClick={() => navigate("/emergency-access")}
              style={{
                padding: "15px 40px",
                background: "linear-gradient(45deg, #10b981, #059669)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              🚨 Request Emergency Access
            </button>
          </div>
        );
      case "invalid":
      case "error":
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "white", textAlign: "center" }}>
            <div style={{ fontSize: "4rem", marginBottom: "20px", color: "#ef4444" }}>❌</div>
            <h2>{status === "invalid" ? "Invalid Verification Link" : "Verification Error"}</h2>
            <p style={{ marginBottom: "30px" }}>{error || "The verification link is invalid or expired."}</p>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "15px 40px",
                background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                cursor: "pointer"
              }}
            >
              Back to Login
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
      minHeight: "100vh",
      color: "white",
      padding: "40px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        maxWidth: "500px",
        width: "100%",
        background: "linear-gradient(145deg, #1e293b, #334155)",
        borderRadius: "24px",
        padding: "60px 40px",
        border: "1px solid #475569",
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        textAlign: "center"
      }}>
        {getStatusUI()}
      </div>
    </div>
  );
}

export default NomineeVerify;
