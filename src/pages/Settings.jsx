import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import ToggleSwitch from '../components/ToggleSwitch';
import './Settings.css';
import { auth } from '../services/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    darkMode: false,
    hideSensitive: false,
    autoLogout: '30min'
  });
  const [selectedSetting, setSelectedSetting] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('datalegacy-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings({
        darkMode: parsed.darkMode || false,
        hideSensitive: parsed.hideSensitive || false,
        autoLogout: parsed.autoLogout || '30min'
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    localStorage.setItem('datalegacy-settings', JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleExport = () => {
    const csvContent = `Email,${user?.email || 'N/A'}
Dark Mode,${settings.darkMode}
Hide Sensitive,${settings.hideSensitive}
Auto Logout,${settings.autoLogout}`;
    const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const download = document.createElement('a');
    download.href = dataStr;
    download.download = 'datalegacy-backup.csv';
    download.click();
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-white text-black dark:bg-slate-900 dark:text-white p-8">Loading...</div>;
  if (!user) {
    navigate('/login');
    return null;
  }

  const closeModal = () => setSelectedSetting(null);

  const openSetting = (setting) => setSelectedSetting(setting);

  const renderModal = () => {
    if (!selectedSetting) return null;

    const commonProps = {
      className: 'settings-modal',
    };

    switch (selectedSetting) {
      case 'autoLogout':
        return (
          <div {...commonProps}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <h3 className="modal-title">Auto Logout</h3>
            <p className="modal-desc">Set inactivity timeout</p>
            <div className="modal-content">
              <select 
                value={settings.autoLogout} 
                onChange={(e) => {
                  handleSelectChange('autoLogout', e.target.value);
                  setTimeout(closeModal, 1000);
                }} 
                className="select"
              >
                <option value="5min">5 minutes</option>
                <option value="15min">15 minutes</option>
                <option value="30min">30 minutes</option>
                <option value="1hr">1 hour</option>
                <option value="never">Never</option>
              </select>
            </div>
          </div>
        );
      case 'hideSensitive':
        return (
          <div {...commonProps}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <h3 className="modal-title">Hide Sensitive Data</h3>
            <p className="modal-desc">Hide passwords by default</p>
            <div className="modal-content">
              <ToggleSwitch 
                id="hideSensitive" 
                checked={settings.hideSensitive} 
                onChange={() => {
                  handleToggle('hideSensitive');
                  setTimeout(closeModal, 1000);
                }} 
              />
            </div>
          </div>
        );
      case 'darkMode':
        return (
          <div {...commonProps}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <h3 className="modal-title">Dark Mode</h3>
            <p className="modal-desc">Theme preference</p>
            <div className="modal-content">
              <ToggleSwitch 
                id="darkMode" 
                checked={settings.darkMode} 
                onChange={() => {
                  handleToggle('darkMode');
                  setTimeout(closeModal, 1000);
                }} 
              />
            </div>
          </div>
        );
      case 'logout':
        return (
          <div {...commonProps}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <h3 className="modal-title">Confirm Logout</h3>
            <p className="modal-desc">Are you sure you want to log out?</p>
            <div className="modal-footer">
              <button className="btn-modal btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="btn-modal btn-confirm" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="settings-container">
      <Sidebar />
      <div className="settings-main">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="settings-header">
            <h1 className="settings-title">Settings</h1>
            <p className="settings-subtitle">Manage your preferences</p>
          </div>

          <div className="settings-section">
            <h2 className="settings-section-title">Security</h2>
            <div className="settings-grid">
              <div className="settings-card" onClick={() => openSetting('autoLogout')}>
                <h3 className="settings-card-title">Auto Logout</h3>
                <p className="settings-card-desc">Set inactivity timeout</p>
                <svg className="settings-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="settings-card" onClick={() => openSetting('logout')}>
                <h3 className="settings-card-title text-red-600 dark:text-red-400">Logout</h3>
                <p className="settings-card-desc">Sign out of account</p>
                <svg className="settings-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h2 className="settings-section-title">Privacy</h2>
            <div className="settings-grid">
              <div className="settings-card" onClick={() => openSetting('hideSensitive')}>
                <h3 className="settings-card-title">Hide Sensitive Data</h3>
                <p className="settings-card-desc">Blur passwords by default across app</p>
                <svg className="settings-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h2 className="settings-section-title">Appearance</h2>
            <div className="settings-grid">
              <div className="settings-card" onClick={() => openSetting('darkMode')}>
                <h3 className="settings-card-title">Dark Mode</h3>
                <p className="settings-card-desc">Light / Dark theme switch</p>
                <svg className="settings-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h2 className="settings-section-title">Backup</h2>
            <div className="settings-grid">
              <div className="settings-card btn-export" onClick={handleExport} style={{cursor: 'pointer'}}>
                <h3 className="settings-card-title">Export Data</h3>
                <p className="settings-card-desc">Download CSV backup</p>
                <svg className="settings-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10l-5.5 5.5m0 0L8 18l5.5-5.5M8 18l-2.5-2.5M12 10l5.5 5.5m0 0L16 18l-5.5-5.5M16 18l2.5-2.5" />
                </svg>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h2 className="settings-section-title">Account</h2>
            <div className="settings-grid">
              <div className="settings-card" onClick={() => navigate('/profile')} style={{cursor: 'pointer'}}>
                <h3 className="settings-card-title">Profile</h3>
                <p className="settings-card-desc">Manage account details</p>
                <svg className="settings-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        {selectedSetting && (
          <div className="settings-backdrop" onClick={closeModal}>
            {renderModal()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
