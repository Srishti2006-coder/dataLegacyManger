
import { useState, useEffect, useRef } from "react";
import { auth, db } from "../services/firebase";
import { encryptField } from "../services/encryption";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Sidebar from "../layout/Sidebar";

function AddAsset() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("password");
  const [notes, setNotes] = useState("");
  const [rawData, setRawData] = useState(""); // AI Scanner raw paste
  const [showAdvanced, setShowAdvanced] = useState(false); // Toggle scanner

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false); // Fix hover

  const dropdownRef = useRef(null);

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

const selectedCategory = categories.find(cat => cat.value === category) || categories[0];

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
  formCard: {
    maxWidth: "800px",
    margin: "0 auto",
    background: "linear-gradient(145deg, #1e293b, #334155)",
    borderRadius: "20px",
    padding: "40px",
    border: "1px solid #475569",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
  },
  formTitle: {
    textAlign: "center",
    marginBottom: "30px",
    color: "white",
    fontSize: "1.8rem"
  },
  formGroup: {
    marginBottom: "25px"
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#cbd5e1",
    fontWeight: "500",
    fontSize: "1rem"
  },
  input: {
    width: "100%",
    padding: "15px",
    borderRadius: "10px",
    border: "2px solid #475569",
    background: "#1a1a2e",
    color: "white",
    fontSize: "16px",
    transition: "border-color 0.3s ease",
    outline: "none"
  },
  textarea: {
    width: "100%",
    padding: "15px",
    borderRadius: "10px",
    border: "2px solid #475569",
    background: "#1a1a2e",
    color: "white",
    fontSize: "16px",
    minHeight: "100px",
    resize: "vertical",
    transition: "border-color 0.3s ease",
    outline: "none"
  },
  dropdownContainer: {
    position: "relative",
    marginBottom: "25px"
  },
  dropdownButton: {
    width: "100%",
    padding: "15px",
    borderRadius: "10px",
    border: "2px solid #475569",
    background: "#1a1a2e",
    color: "white",
    fontSize: "16px",
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "border-color 0.3s ease",
    outline: "none"
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#1a1a2e",
    border: "2px solid #475569",
    borderRadius: "10px",
    maxHeight: "200px",
    overflowY: "auto",
    zIndex: 1000,
    marginTop: "5px"
  },
  dropdownItem: {
    padding: "12px 15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "background-color 0.3s ease",
    borderBottom: "1px solid #475569"
  },
  errorMessage: {
    color: "#ef4444",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid #ef4444",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "20px",
    textAlign: "center"
  },
  successMessage: {
    color: "#10b981",
    background: "rgba(16, 185, 129, 0.1)",
    border: "1px solid #10b981",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "20px",
    textAlign: "center"
  },
  saveButton: {
    width: "100%",
    padding: "15px",
    background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "transform 0.3s ease",
    outline: "none"
  },
  saveButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed"
  }
};

useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);



const handleScanAssets = () => {
  if (!rawData.trim()) {
    setError("Please paste raw data first");
    return;
  }

  // Simple AI-like heuristic scanner
  const lowerRaw = rawData.toLowerCase();
  
  // Extract email/username
  const emailMatch = rawData.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    setUsername(emailMatch[0]);
  }

  // Guess title from common patterns
  if (lowerRaw.includes('gmail') || lowerRaw.includes('google')) setTitle('Gmail Account');
  else if (lowerRaw.includes('outlook') || lowerRaw.includes('hotmail')) setTitle('Outlook Account');
  else if (lowerRaw.includes('bank') || lowerRaw.includes('paypal')) setTitle('Bank/Payment Account');
  else if (lowerRaw.includes('@yahoo')) setTitle('Yahoo Account');
  else setTitle('New Account');

  // Guess category
  if (lowerRaw.includes('bank') || lowerRaw.includes('paypal') || lowerRaw.includes('finance')) setCategory('financial');
  else if (lowerRaw.includes('crypto') || lowerRaw.includes('wallet')) setCategory('crypto');
  else if (lowerRaw.includes('netflix') || lowerRaw.includes('spotify')) setCategory('streaming');
  else if (lowerRaw.includes('facebook') || lowerRaw.includes('twitter') || lowerRaw.includes('instagram')) setCategory('social');
  else setCategory('password');

  setError("");
  setSuccess("Assets scanned and auto-filled! Review and save.");
};

// Removed placeholder - now using real CryptoJS from encryption.js

const handleAddAsset = async () => {
  if (!auth.currentUser) {
    setError("You must be logged in to add an asset");
    return;
  }

  if (!title || !username) {
    setError("Please fill title and username");
    return;
  }

  setLoading(true);
  setError("");

  try {
    console.log("Saving asset with data:", {
      userId: auth.currentUser.uid,
      title,
      username,
      password,
      category,
      notes,
    });

    await addDoc(collection(db, "assets"), {
      userId: auth.currentUser.uid,
      title,
      username,
      encryptedPassword: encryptField(password, auth.currentUser?.email || 'default@example.com'), // Encrypted
      category,
      encryptedNotes: encryptField(notes, auth.currentUser?.email || 'default@example.com'), // Encrypted
      createdAt: serverTimestamp()
    });

    setSuccess("Asset saved successfully (encrypted)!");

    setTimeout(() => {
      setTitle("");
      setUsername("");
      setPassword("");
      setNotes("");
      setRawData("");
      navigate("/view-assets");
    }, 1500);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};



return(
  <div style={styles.container}>
    <Sidebar/>
    <div style={styles.main}>
      <div style={styles.header}>
        <h1 style={styles.title}>Add Digital Asset</h1>
        <p style={styles.subtitle}>Securely store your important digital information</p>
      </div>

      <div style={styles.formCard}>
        <h2 style={styles.formTitle}>Asset Information</h2>

        <div style={styles.formGroup}>
          <label style={styles.label}>Asset Title *</label>
          <input
            type="text"
            placeholder="e.g., Gmail Account, Bank Login"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Username/Email *</label>
          <input
            type="text"
            placeholder="Enter username or email"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Password/Security Info</label>
          <input
            type="password"
            placeholder="Enter password or security details"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* AI Asset Scanner */}
        <div style={styles.formGroup}>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              ...styles.saveButton,
              padding: "10px",
              fontSize: "14px",
              background: showAdvanced ? "#ef4444" : "#10b981"
            }}
          >
            {showAdvanced ? "Hide" : "🚀 AI Scan Assets"} (Advanced)
          </button>
        </div>
        {showAdvanced && (
          <div style={styles.formGroup}>
            <label style={styles.label}>Paste Raw Data (email, pw, account info)</label>
            <textarea
              placeholder="Paste messy data here e.g., 'gmail: john@gmail.com pw:secret123 bank login...'"
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
              style={styles.textarea}
            />
            <button
              onClick={handleScanAssets}
              style={{
                ...styles.saveButton,
                padding: "10px",
                marginTop: "10px",
                background: "linear-gradient(45deg, #f59e0b, #fbbf24)"
              }}
            >
              ✨ Scan &amp; Auto-fill
            </button>
          </div>
        )}

        <div style={styles.formGroup}>
          <label style={styles.label}>Category</label>
          <div style={styles.dropdownContainer} ref={dropdownRef}>
            <button
              type="button"
              style={styles.dropdownButton}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedCategory.icon} {selectedCategory.label}
            </button>
            {isDropdownOpen && (
              <ul style={styles.dropdownMenu}>
                {categories.map(cat => (
                  <li
                    key={cat.value}
                    style={styles.dropdownItem}
                    onClick={() => { setCategory(cat.value); setIsDropdownOpen(false); }}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    style={isHovering ? { backgroundColor: '#334155' } : styles.dropdownItem}
                  >
                    {cat.icon} {cat.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Additional Notes</label>
          <textarea
            placeholder="Any additional information or instructions"
            value={notes}
            onChange={(e)=>setNotes(e.target.value)}
            style={styles.textarea}
          />
        </div>

        {error && <div style={styles.errorMessage}>{error}</div>}
        {success && <div style={styles.successMessage}>{success}</div>}

        <button
          onClick={handleAddAsset}
          disabled={loading}
          style={{
            ...styles.saveButton,
            ...(loading ? styles.saveButtonDisabled : {}),
            transform: loading || !isHovering ? 'none' : 'scale(1.02)'
          }}
          onMouseEnter={() => !loading && setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {loading ? "Saving Asset..." : "Save Digital Asset"}
        </button>
      </div>
    </div>
  </div>
);

}

export default AddAsset;