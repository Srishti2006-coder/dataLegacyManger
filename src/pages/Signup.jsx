import { useState } from "react";
import { auth, db } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Signup(){

const navigate = useNavigate();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [showPassword, setShowPassword] = useState(false);

const handleSignup = async () => {
  if (!email || !password) {
    setError("Please fill in all fields");
    return;
  }

  if (password.length < 6) {
    setError("Password must be at least 6 characters");
    return;
  }

  setLoading(true);
  setError("");
  setSuccess("");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      createdAt: serverTimestamp()
    });

    setSuccess("Account created successfully!");
    setTimeout(() => navigate("/login"), 1000);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

return(
  <div className="full-screen-auth-container">
  <div className="minimal-auth-form page-animate">

    <h2 className="simple-title">Create Account</h2>
    <p className="simple-subtitle">Safeguard your digital legacy for generations to come.</p>


    <div className="clean-input-group">
      <input
        className="clean-input"
        type="email"
        placeholder=" "
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label className="clean-label">Email</label>
    </div>

    <div className="clean-input-group">
      <div className="password-input-container">
        <input
          className="clean-input"
          type={showPassword ? "text" : "password"}
          placeholder=" "
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label className="clean-label">Password</label>
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
          title={showPassword ? "Hide" : "Show"}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
    </div>

    {error && <div className="auth-error">{error}</div>}
    {success && <div className="auth-success">{success}</div>}

    <button
      className="professional-btn"
      onClick={handleSignup}
      disabled={loading}
    >
      {loading && <span className="loading-spinner"></span>}
      {loading ? "Creating Account..." : "Create Account"}
    </button>

    <p>
      Already have an account?
      <a href="/login" className="simple-link"> Login</a>
    </p>
  </div>
</div>
);

}

export default Signup;
