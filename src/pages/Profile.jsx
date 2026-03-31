import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="profile-container">
      <Sidebar />

      <div className="profile-main">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="profile-header">
            <h1 className="profile-title">Profile</h1>
            <p className="profile-subtitle">Your personal details</p>
          </div>

          {/* 🔥 HORIZONTAL GLOSSY CARD */}
          <div className="profile-glass-card">
            <div className="profile-mini-avatar">S</div>

            <div className="profile-glass-info">
              <h3>Srishti</h3>
              <p>srishtibansal505@gmail.com</p>
              <p>📞 7973987840</p>
              <p>Joined: 15/03/2026</p>
            </div>
          </div>

          {/* 🚀 ACTION CARDS (HORIZONTAL) */}
          <div className="actions-grid">

            <div className="action-card" onClick={() => navigate('/add-asset')}>
              <div className="action-icon">➕</div>
              <h3>Add Asset</h3>
            </div>

            <div className="action-card" onClick={() => navigate('/nominee')}>
              <div className="action-icon">➕</div>
              <h3>Add Nominee</h3>
            </div>

            <div className="action-card" onClick={() => navigate('/view-nominee')}>
              <div className="action-icon">👁</div>
              <h3>View Nominee</h3>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;