import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyNomineeToken } from "../services/firebase";

function NomineeVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying");
  const [error, setError] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setError("No verification token found.");
      return;
    }

    const verify = async () => {
      try {
        setStatus("verifying");

        await verifyNomineeToken({ token });

        setStatus("success");
      } catch (err) {
        console.error(err);
        setError(err.message || "Verification failed.");
        setStatus("error");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="nominee-verify-container page-animate" style={{
      background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
      minHeight: "100vh",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div className="nominee-verify-card" style={{
        maxWidth: "500px",
        width: "100%",
        background: "#1e293b",
        padding: "40px",
        borderRadius: "20px",
        textAlign: "center"
      }}>
        {status === "verifying" && <h2>Verifying...</h2>}

        {status === "success" && (
          <>
            <h2 style={{ color: "#10b981" }}>Verified 🎉</h2>
            <p>You are now a verified nominee.</p>
          </>
        )}

        {(status === "error" || status === "invalid") && (
          <>
            <h2 style={{ color: "red" }}>Error</h2>
            <p>{error}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default NomineeVerify;