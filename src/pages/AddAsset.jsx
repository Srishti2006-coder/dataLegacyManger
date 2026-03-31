
import React, { useState, useCallback } from 'react';
import { auth, db } from '../services/firebase';
import { encryptField } from '../services/encryption';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import TagInput from '../components/TagInput';
import './AddAsset.css';

function AddAsset() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [credentials, setCredentials] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);
  // Note fields removed for professional look
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const suggestions = [
    'Social', 'Finance', 'Work', 'Education', 'Health', 'Crypto', 
    'Email', 'Banking', 'Shopping', 'Streaming', 'Password', 'Insurance'
  ];

  const handleSaveAsset = useCallback(async () => {
    if (!title.trim() || !identifier.trim() || !credentials.trim()) {
      setError('Please fill all required fields: Title, Identifier, Credentials.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const encryptedCredentials = encryptField(credentials, auth.currentUser?.email || '');
      
      await addDoc(collection(db, 'assets'), {
        userId: auth.currentUser?.uid,
        title: title.trim(),
        identifier: identifier.trim(),
        encryptedCredentials,
        tags,
        createdAt: serverTimestamp()
      });

setSuccess('[OK] Asset saved securely!');
      setTimeout(() => {
        // Reset form
        setTitle('');
        setIdentifier('');
        setCredentials('');
        // setNote removed
            // setShowNote removed
        setTags([]);
        navigate('/view-assets');
      }, 1500);
    } catch (err) {
      setError('Failed to save asset: ' + err.message);
    } finally {
      setLoading(false);
    }
}, [title, identifier, credentials, tags, navigate]);

  const handleCancel = () => {
    navigate('/view-assets');
  };

  return (
    <div className="add-asset-container">
      <Sidebar />
      <div className="add-asset-main">
        <div className="add-asset-card">
          <div className="add-asset-header">
            <h1 className="add-asset-title">Add Asset</h1>
            <p className="add-asset-subtitle">Store sensitive information securely</p>
          </div>

          <p className="security-notice">
            Your data is encrypted and stored securely.
          </p>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Asset Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Gmail Account"
              className="form-input"
            />
          </div>

          {/* Identifier */}
          <div className="form-group">
            <label className="form-label">Identifier (email/username/account) *</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="user@example.com or username"
              className="form-input"
            />
          </div>

          {/* Password/Credentials */}
          <div className="form-group">
            <label className="form-label">Password / Credentials *</label>
            <div className="password-wrapper">
              <input
                type={showCredentials ? 'text' : 'password'}
                value={credentials}
                onChange={(e) => setCredentials(e.target.value)}
                placeholder="Enter secure password or credentials"
                className="form-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowCredentials(!showCredentials)}
                title={showCredentials ? "Hide" : "Show"}
              >
                {showCredentials ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Note section removed for professional credentials-only form */}

          {/* Tags */}
          <div className="form-group tag-group">
            <label className="form-label">Category / Tags</label>
            <TagInput
              value={tags}
              onChange={setTags}
              suggestions={suggestions}
              placeholder="Type or select a category (e.g., Work, Finance...)"
            />
            <small className="tag-hint">
              Press Enter to add, Backspace to remove last
            </small>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="button-group">
            <button
              onClick={handleSaveAsset}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Saving...' : 'Save Asset'}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddAsset;