import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { collection, query, where, getDocs, getCountFromServer, doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Sidebar from '../layout/Sidebar';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ assetsCount: 0, nomineesCount: 0, categoriesCount: 0, storageUsed: '0 MB' });
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyContact: '',
    joined: '',
    lastLogin: 'Today',
    status: 'Active'
  });
  const [editingField, setEditingField] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [profileComplete, setProfileComplete] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchStats(), fetchUserProfile()]);
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const userId = auth.currentUser.uid;

      // Assets count
      const assetsQuery = query(collection(db, 'assets'), where('userId', '==', userId));
      const assetsSnapshot = await getCountFromServer(assetsQuery);
      const assetsCount = assetsSnapshot.data().count;

      // Nominees count
      const nomineesQuery = query(collection(db, 'nominees'), where('userId', '==', userId));
      const nomineesSnapshot = await getCountFromServer(nomineesQuery);
      const nomineesCount = nomineesSnapshot.data().count;

      // Categories (simple unique count from assets)
      const assetsDocsQuery = query(collection(db, 'assets'), where('userId', '==', userId));
      const assetsDocs = await getDocs(assetsDocsQuery);
      const categories = new Set();
      assetsDocs.forEach(docSnap => {
        const data = docSnap.data();
        if (data.tags) data.tags.forEach(tag => categories.add(tag));
        if (data.category) categories.add(data.category);
      });
      const categoriesCount = categories.size;

      setStats({ assetsCount, nomineesCount, categoriesCount, storageUsed: '2.1 MB' });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
      } else {
        // Default/mock data
      const defaultData = {
  name: 'Srishti',
  email: 'srishtibansal505@gmail.com',
  phone: '7973987840',
  emergencyContact: '',
  joined: '15/03/2026',
  lastLogin: 'Today',
  status: 'Active'
};
        setUserData(defaultData);
        // Optionally create: await setDoc(userRef, defaultData, { merge: true });
      }
      // Mock completeness (improve with logic)
      setProfileComplete(80);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileComplete(0);
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  const handleFieldChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (field) => {
    if (!auth.currentUser) return;
    try {
      const updates = { [field]: userData[field] };
      await updateDoc(doc(db, 'users', auth.currentUser.uid), updates);
      console.log(`Saved ${field}:`, userData[field]); // Structure ready
    } catch (error) {
      console.error('Save failed:', error);
    }
    setEditingField(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Mock recent activity
  useEffect(() => {
    setRecentActivity([
      { id: 1, action: 'Added new asset', type: 'asset', time: '2 hours ago' },
      { id: 2, action: 'Edited nominee details', type: 'nominee', time: '1 day ago' },
      { id: 3, action: 'Viewed vault summary', type: 'vault', time: '3 days ago' }
    ]);
  }, []);

  if (loading) {
    return (
      <div className="profile-container">
        <Sidebar />
        <div className="profile-main page-animate">
          <div className="max-w-4xl mx-auto p-8 text-center">Loading profile...</div>
        </div>
      </div>
    );
  }

  const fields = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'tel' },
    { key: 'emergencyContact', label: 'Emergency Contact', type: 'text', placeholder: 'Name + Phone (e.g. John Doe 123-456-7890)' }
  ];

  return (
    <div className="profile-container">
      <Sidebar />

      <div className="profile-main page-animate">
        <div className="max-w-4xl mx-auto">

          {/* Header + Completeness */}
          <div className="profile-header">
            <h1 className="profile-title">Profile</h1>
            <p className="profile-subtitle">Your personal details & digital legacy overview</p>
            <div className="completeness-container">
              <span>Profile {profileComplete}% Complete</span>
              <div className="completeness-bar">
                <div className="completeness-fill" style={{ width: `${profileComplete}%` }}></div>
              </div>
            </div>
          </div>

          {/* Profile Glass Card */}
          <div className="profile-glass-card">
            <div className="profile-mini-avatar">{userData.name?.[0]?.toUpperCase() || 'U'}</div>
            <div className="profile-glass-info">
              <h3>{userData.name || 'User'}</h3>
              <p>{userData.email || 'No email'}</p>
              <p> {userData.phone || 'No phone'}</p>
              <p>Joined: {userData.joined}</p>
            </div>
          </div>

          {/* Editable Info Grid - Updated Layout */}
          <div className="info-grid">
            {/* Top row: Name, Email, Phone */}
            <div className="info-row-top">
              {fields.slice(0, 3).map(({ key, label, type, placeholder }) => (
                <div key={key} className="info-card editable-field">
                  <h4>{label}</h4>
                  {editingField === key ? (
                    <div className="edit-mode">
                      <input
                        type={type}
                        value={userData[key] || ''}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className="edit-input"
                        placeholder={placeholder}
                        autoFocus
                      />
                      <div className="edit-buttons">
                        <button onClick={() => handleSave(key)} className="btn-save"> Save</button>
                        <button onClick={handleCancel} className="btn-cancel"> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="display-mode">
                      <p>{userData[key] || 'Not set'}</p>
                      <button onClick={() => handleEdit(key)} className="edit-btn">Edit</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Bottom row: Emergency Contact (full width) */}
            <div className="info-row-bottom">
              {fields.slice(3).map(({ key, label, type, placeholder }) => (
                <div key={key} className="info-card editable-field">
                  <h4>{label}</h4>
                  {editingField === key ? (
                    <div className="edit-mode">
                      <input
                        type={type}
                        value={userData[key] || ''}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className="edit-input"
                        placeholder={placeholder}
                        autoFocus
                      />
                      <div className="edit-buttons">
                        <button onClick={() => handleSave(key)} className="btn-save"> Save</button>
                        <button onClick={handleCancel} className="btn-cancel"> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="display-mode">
                      <p>{userData[key] || 'Not set'}</p>
                      <button onClick={() => handleEdit(key)} className="edit-btn">Edit</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Account Summary Card */}
          <div className="account-summary">
  <h3 className="section-title">Account Summary</h3>
  <p className="summary-desc">
    This section gives a quick overview of your account activity and current status.
  </p>

  <div className="summary-card glass-card">
    <div className="summary-item">
      <label>Joined:</label>
      <span>{userData.joined}</span>
    </div>

    <div className="summary-item">
      <label>Last Login:</label>
      <span>{userData.lastLogin}</span>
    </div>

    <div className="summary-item">
      <label>Status:</label>
      <span className="status-badge status-active">
        {userData.status}
      </span>
    </div>
  </div>
</div>
          {/* Recent Activity (Timeline prep) */}
          <div className="activity-section">
            <h3 className="section-title">Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <div className="empty-state">
                <p>No recent activity yet</p>
              </div>
            ) : (
              <div className="activity-timeline">
                {recentActivity.map((item, index) => (
                  <div key={item.id} className="activity-item">
                    <div className="activity-icon">{item.type === 'asset' ? '💰' : item.type === 'nominee' ? '👤' : '🔒'}</div>
                    <div className="activity-content">
                      <p>{item.action}</p>
                      <small>{item.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Cards */}
          <div className="actions-grid">
            <div className="action-card" onClick={() => navigate('/add-asset')}>

              <div className="action-icon">➕</div>
              <h3>Add Asset</h3>
            </div>
            <div className="action-card" onClick={() => navigate('/nominee')}>
              <div className="action-icon">➕</div>
              <h3>Add Nominee</h3>
            </div>
            <div className="action-card" onClick={() => navigate('/view-assets')}>
              <div className="action-icon">👁</div>
              <h3>View Assets</h3>
            </div>
          </div>

          {/* Account Actions */}
          <div className="account-actions fade-in">
            <button className="settings-btn" onClick={() => navigate('/settings')}>
               Account Settings
            </button>
            <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
              Logout
            </button>
          </div>

        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowLogoutModal(false)} />
          <div className="modal-container">
            <div className="modal-content">
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout?</p>
              <div className="modal-buttons">
                <button onClick={() => setShowLogoutModal(false)} className="btn-cancel">Cancel</button>
                <button onClick={handleLogout} className="btn-danger">Logout</button>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default Profile;

