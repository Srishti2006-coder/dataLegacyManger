import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

import AddAsset from "./pages/AddAsset";
import ViewAssets from "./pages/ViewAssets";
import Nominee from "./pages/Nominee";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Vault from "./pages/Vault";
import Will from "./pages/Will";
import NomineeVerify from "./pages/NomineeVerify";
import EmergencyAccess from "./pages/EmergencyAccess";
import { auth } from "./services/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useCallback } from "react";

function AppContent() {
  const navigate = useNavigate();
  let logoutTimer;

  const resetTimer = useCallback(() => {
    if (logoutTimer) clearTimeout(logoutTimer);
    const saved = localStorage.getItem('datalegacy-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.autoLogout && parsed.autoLogout !== 'never') {
        const times = { '5min': 5*60*1000, '15min': 15*60*1000, '30min': 30*60*1000, '1hr': 60*60*1000 };
        logoutTimer = setTimeout(() => {
          signOut(auth).then(() => navigate('/login'));
        }, times[parsed.autoLogout]);
      }
    }
  }, [navigate]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'scroll'];
    events.forEach(event => document.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      events.forEach(event => document.removeEventListener(event, resetTimer));
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, [resetTimer]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/add-asset" element={<AddAsset />} />
      <Route path="/view-assets" element={<ViewAssets />} />
      <Route path="/nominee" element={<Nominee />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/vault" element={<Vault />} />
      <Route path="/will" element={<Will />} />
      <Route path="/nominee-verify" element={<NomineeVerify />} />
      <Route path="/emergency-access" element={<EmergencyAccess />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
