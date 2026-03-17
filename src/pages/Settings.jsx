import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../layout/Sidebar';
import { auth, db } from '../services/firebase';
import { collection, query, where, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { saveUserSettings, resetLastActive, updateUserPassword, deleteUserAccount, toggleEmergencyAccess } from '../services/firebase';

const Settings = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [activeTab, setActiveTab] = useState('security');
  const [assets, setAssets] = useState([]);
  const [nominees, setNominees] = useState([]);
  const { theme: appTheme, toggleTheme } = useTheme();
  const [userSettings, setUserSettings] = useState({
    notifications: { email: true, emergency: true, nomineeVerify: true },
    ai: { chatbot: true, autofill: true },
    emergency: { enabled: false, delayHours: 24, requireOTP: true },
    lastActive: null,
    emergencyTriggered: false
  });
  const [loading, setLoading] = useState(true);
  const [lastActive, setLastActive] = useState(null);

  // Tabs config
  const tabs = [
    { id: 'security', label: '🔐 Security', icon: 'shield' },
    { id: 'account', label: '👤 Account', icon: 'user' },
    { id: 'emergency', label: '🚨 Nominee & Emergency', icon: 'alert' },
    { id: 'notifications', label: '🔔 Notifications', icon: 'bell' },
    { id: 'ai', label: '🤖 AI Settings', icon: 'robot' },
    { id: 'appearance', label: '🎨 Appearance', icon: 'palette' },
    { id: 'privacy', label: '📊 Data & Privacy', icon: 'database' }
  ];

  // Fetch user data + realtime listeners (Phase 2 Step 8-9)
  const fetchUserData = async () => {
    if (!user) return;
    try {
      // Assets & Nominees (static)
      const assetsQ = query(collection(db, 'assets'), where('userId', '==', user.uid));
      const assetsSnap = await getDocs(assetsQ);
      setAssets(assetsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const nomineesQ = query(collection(db, 'nominees'), where('userId', '==', user.uid));
      const nomineesSnap = await getDocs(nomineesQ);
      setNominees(nomineesSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Realtime user settings + emergency status
      const userRef = doc(db, 'users', user.uid);
      onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserSettings(data.settings || {});
          // WOW Feature: Check emergency countdown
          if (data.lastActive && data.settings?.emergency?.enabled) {
            const inactiveDays = (Date.now() - new Date(data.lastActive.toDate())) / (1000 * 60 * 60 * 24);
            if (inactiveDays > 30) {
              setUserSettings(prev => ({ ...prev, emergencyTriggered: true }));
            }
          }
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Fetch error:', error);
      setLoading(false);
    }
  }


  useEffect(() => {
    fetchUserData();
  }, [user]);

  // Update lastActive to prevent emergency trigger
  useEffect(() => {
    if (user && lastActive) {
      // Call CF later: cancelEmergency
    }
  }, [activeTab]);

  // Enhanced handlers with Firebase integration (Phase 2)
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const selectedAssets = Array.from(e.target.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
    
    if (newPassword !== formData.get('confirmPassword')) {
      alert('Passwords do not match');
      return;
    }
    
    try {
      await updateUserPassword({ currentPassword, newPassword, assetIds: selectedAssets });
      alert('Password & credentials updated successfully!');
      e.target.reset();
    } catch (error) {
      alert('Update failed: ' + error.message);
    }
  };

  const handleToggleChange = async (section, value) => {
    const newUserSettings = { ...userSettings, [section]: value };
    setUserSettings(newUserSettings);
    try {
      await saveUserSettings(newUserSettings);
      console.log('Settings saved:', section);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Permanently delete account and all data? This cannot be undone.')) {
      try {
        await deleteUserAccount();
        alert('Account deleted successfully');
        auth.signOut();
        navigate('/');
      } catch (error) {
        alert('Delete failed: ' + error.message);
      }
    }
  };

  const handleEmergencyToggle = async (enabled) => {
    const newEmergency = { ...userSettings.emergency, enabled };
    await handleToggleChange('emergency', newEmergency);
    await toggleEmergencyAccess(newEmergency);
  };

// Update lastActive on tab change/page load (resets emergency countdown)
  const updateLastActive = async () => {
    if (user) {
      try {
        await resetLastActive();
        setLastActive(new Date().toISOString());
        setUserSettings(prev => ({ ...prev, emergencyTriggered: false }));
      } catch (error) {
        console.error('Last active update failed:', error);
      }
    }
  };

  useEffect(() => {
    updateLastActive();
  }, []);

  // Update on tab change too
  useEffect(() => {
    const timer = setTimeout(updateLastActive, 1000);
    return () => clearTimeout(timer);
  }, [activeTab]);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) return <div className="loading">Loading settings...</div>;

  return (
    <div className="settings-page" style={{
      display: 'flex', minHeight: '100vh',
      background: 'linear-gradient(145deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
    }}>
      <Sidebar />
      <div className="settings-content" style={{ flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '40px', textAlign: 'center' }}>
          Settings
        </h1>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex', gap: '10px', marginBottom: '40px', flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '15px 30px', borderRadius: '50px', border: 'none',
                background: activeTab === tab.id ? 'linear-gradient(45deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)',
                color: 'white', fontWeight: 'bold', cursor: 'pointer',
                backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Emergency Alert Banner */}
        {userSettings.emergencyTriggered && (
          <div style={{
            background: 'linear-gradient(45deg, #ef4444, #dc2626)', 
            color: 'white', padding: '20px', borderRadius: '12px', 
            marginBottom: '30px', textAlign: 'center', boxShadow: '0 10px 30px rgba(239,68,68,0.4)'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>🚨 EMERGENCY ACCESS TRIGGERED</h3>
            <p style={{ margin: 0 }}>Your nominee has been notified. You have 24 hours to cancel.</p>
              <button 
              onClick={async () => {
                try {
                  await cancelEmergency(); 
                  setUserSettings(prev => ({ ...prev, emergencyTriggered: false }));
                  alert('Emergency cancelled successfully!');
                } catch (e) { alert('Cancel failed: ' + e.message); }
              }}
              style={{
                marginTop: '10px', padding: '10px 20px', background: 'rgba(255,255,255,0.2)',
                border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              Cancel Emergency Access
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'security' && (
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '24px', backdropFilter: 'blur(20px)' }}>
              <h2 style={{ color: 'white', marginBottom: '30px' }}>🔐 Security</h2>
              <form onSubmit={handlePasswordChange} style={{ maxWidth: '500px' }}>
                <div style={{ marginBottom: '20px', color: 'white' }}>
                  <label>Select Assets to Update Credentials:</label>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '10px' }}>
                    {assets.map(asset => (
                      <label key={asset.id} style={{ display: 'block', marginBottom: '10px', color: '#e2e8f0' }}>
                        <input type="checkbox" value={asset.id} name="assets" /> {asset.title || 'Untitled'} ({asset.category})
                      </label>
                    ))}
                  </div>
                </div>
                <input required type="password" name="currentPassword" placeholder="Current Password" style={{ width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #475569' }} />
                <input required type="password" name="newPassword" placeholder="New Password" style={{ width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #475569' }} />
                <input required type="password" name="confirmPassword" placeholder="Confirm New Password" style={{ width: '100%', padding: '15px', marginBottom: '20px', borderRadius: '12px', border: '1px solid #475569' }} />
                <button type="submit" style={{
                  width: '100%', padding: '15px', background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                  color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold'
                }}>
                  Update Password & Credentials
                </button>
              </form>
              {assets.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '20px' }}>Add assets first to manage credentials.</p>}
            </div>
          )}

          {activeTab === 'emergency' && (
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '24px', backdropFilter: 'blur(20px)' }}>
              <h2 style={{ color: 'white', marginBottom: '30px' }}>🚨 Nominee & Emergency</h2>
              <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
                <label style={{ color: 'white' }}>
                  <input
                    type="checkbox"
                    checked={userSettings.emergency.enabled}
                    onChange={(e) => handleToggleChange('emergency', { ...userSettings.emergency, enabled: e.target.checked })}
                  />
                  Enable Emergency Access ({nominees.length} verified nominees)
                </label>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#e2e8f0' }}>
                  <label>Delay:</label>
                  <input type="number" defaultValue={24} min={1} max={168} style={{ padding: '8px', borderRadius: '6px' }} />
                  <span>hours</span>
                </div>
                <label style={{ color: '#e2e8f0' }}>
                  <input type="checkbox" checked={userSettings.emergency.requireOTP} onChange={(e) => handleToggleChange('emergency', { ...userSettings.emergency, requireOTP: e.target.checked })} />
                  Require OTP for nominee access
                </label>

                {nominees.length > 0 && (
                  <div>
                    <h3 style={{ color: 'white', marginBottom: '10px' }}>Verified Nominees:</h3>
                    <ul style={{ color: '#e2e8f0' }}>
                      {nominees.filter(n => n.verified).map(n => (
                        <li key={n.id}>{n.name} ({n.email})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '24px' }}>
              <h2 style={{ color: 'white' }}>🔔 Notifications</h2>

              <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
                <label><input type="checkbox" checked={userSettings.notifications.email} onChange={(e) => handleToggleChange('notifications', { ...userSettings.notifications, email: e.target.checked })} /> Email Notifications</label>
                <label><input type="checkbox" checked={userSettings.notifications.emergency} onChange={(e) => handleToggleChange('notifications', { ...userSettings.notifications, emergency: e.target.checked })} /> Emergency Alerts</label>
                <label><input type="checkbox" checked={userSettings.notifications.nomineeVerify} onChange={(e) => handleToggleChange('notifications', { ...userSettings.notifications, nomineeVerify: e.target.checked })} /> Nominee Verification</label>
              </div>

            </div>
          )}

          {activeTab === 'ai' && (
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '24px' }}>
              <h2 style={{ color: 'white' }}>🤖 AI Settings</h2>
              <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
                <label><input type="checkbox" checked={userSettings.ai.chatbot} onChange={(e) => handleToggleChange('ai', { ...userSettings.ai, chatbot: e.target.checked })} /> AI Chatbot (VaultAI)</label>
                <label><input type="checkbox" checked={userSettings.ai.autofill} onChange={(e) => handleToggleChange('ai', { ...userSettings.ai, autofill: e.target.checked })} /> AI Auto-fill Suggestions</label>

              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '24px' }}>
              <h2 style={{ color: 'white' }}>🎨 Appearance</h2>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', marginTop: '20px' }}>
                <input
                  type="checkbox"
                  checked={appTheme === 'dark'}
                  onChange={(e) => toggleTheme(e.target.checked ? 'dark' : 'light')}
                />
                Dark Mode ({appTheme})
              </label>

            </div>
          )}

          {activeTab === 'privacy' && (
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '24px' }}>
              <h2 style={{ color: 'white' }}>📊 Data & Privacy</h2>
              <button
                onClick={handleDeleteAccount}
                style={{
                  padding: '20px 40px', background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                  color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.1rem',
                  fontWeight: 'bold', cursor: 'pointer', marginTop: '30px'
                }}
              >
                🗑️ Delete Account (Irreversible)
              </button>
              <p style={{ color: '#94a3b8', marginTop: '20px' }}>
                This will permanently delete all your assets, nominees, and account.
              </p>
            </div>
          )}

          {activeTab === 'account' && (
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '24px' }}>
              <h2 style={{ color: 'white' }}>👤 Account</h2>
              <p style={{ color: '#e2e8f0' }}>Email: {user.email}</p>
              <p style={{ color: userSettings.emergencyTriggered ? '#f59e0b' : '#94a3b8', fontWeight: userSettings.emergencyTriggered ? 'bold' : 'normal' }}>
                Last Active: {lastActive ? new Date(lastActive).toLocaleString() : 'Never'}
                {userSettings.emergencyTriggered && ' ⚠️ EMERGENCY ACCESS REQUESTED!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

