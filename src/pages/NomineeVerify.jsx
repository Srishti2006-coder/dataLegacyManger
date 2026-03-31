
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
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

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setError("No verification token found.");
      return;
    }

    if (!user) {
      navigate(
        `/login?redirect=nominee-verify&token=${encodeURIComponent(token)}`,
        { replace: true }
      );
      return;
    }

    const verify = async () => {
      try {
        setStatus("verifying");

        await verifyNomineeToken({ token });

        setStatus("success");
      } catch (err) {
        setError(err.message || "Verification failed.");
        setStatus("error");
      }
    };

    verify();
  }, [token, user, navigate]);

  return (
    <div style={{
      background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
      minHeight: "100vh",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
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
            <button onClick={() => navigate("/emergency-access")}>
              Request Emergency Access
            </button>
          </>
        )}

        {(status === "error" || status === "invalid") && (
          <>
            <h2 style={{ color: "red" }}>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate("/login")}>
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default NomineeVerify;