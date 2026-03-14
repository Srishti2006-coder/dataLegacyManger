import { useState } from "react";
import { auth, db } from "../services/firebase";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddAsset = async () => {
    if (!title || !username) {
      setError("Please fill in at least title and username");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await addDoc(collection(db, "assets"), {
        userId: auth.currentUser.uid,
        title: title,
        username: username,
        password: password,
        category: category,
        notes: notes,
        createdAt: serverTimestamp()
      });

      alert("Asset saved successfully");
      navigate("/view-assets");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-asset-container">
      <Sidebar />

      <div className="add-asset-main">
        <div className="add-asset-card">
          <h1 className="add-asset-title">Add Digital Asset</h1>
          <p className="add-asset-subtitle">Securely store your digital credentials and important information</p>

          <div className="add-asset-form-group">
            <label className="add-asset-label">Asset Title *</label>
            <input
              className="add-asset-input"
              type="text"
              placeholder="e.g., Gmail Account, Bank Login"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="add-asset-form-group">
            <label className="add-asset-label">Category</label>
            <select
              className="add-asset-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="password">Password/Credentials</option>
              <option value="financial">Financial</option>
              <option value="personal">Personal Documents</option>
              <option value="social">Social Media</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="add-asset-form-group">
            <label className="add-asset-label">Username / Email *</label>
            <input
              className="add-asset-input"
              type="text"
              placeholder="Enter username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="add-asset-form-group">
            <label className="add-asset-label">Password</label>
            <input
              className="add-asset-input"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="add-asset-form-group">
            <label className="add-asset-label">Notes</label>
            <textarea
              className="add-asset-textarea"
              placeholder="Additional notes or instructions"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p style={{ color: "#ef4444", marginBottom: "20px" }}>{error}</p>}

          <button
            className="add-asset-button"
            onClick={handleAddAsset}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Asset"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddAsset;