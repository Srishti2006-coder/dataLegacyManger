/** Restored Stable App.js - Static Imports, Simple Routing, Basic Auth Guard */
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./services/firebase";

// Static imports for all pages - no lazy loading
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

// Simple ProtectedRoute component for basic auth guard
function ProtectedRoute({ children }) {
  const user = auth.currentUser;
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/add-asset" element={
          <ProtectedRoute>
            <AddAsset />
          </ProtectedRoute>
        } />
        <Route path="/view-assets" element={
          <ProtectedRoute>
            <ViewAssets />
          </ProtectedRoute>
        } />
        <Route path="/nominee" element={
          <ProtectedRoute>
            <Nominee />
          </ProtectedRoute>
        } />
        <Route path="/nominee-verify" element={
          <ProtectedRoute>
            <NomineeVerify />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/vault" element={
          <ProtectedRoute>
            <Vault />
          </ProtectedRoute>
        } />
        <Route path="/will" element={
          <ProtectedRoute>
            <Will />
          </ProtectedRoute>
        } />
        <Route path="/emergency-access" element={
          <ProtectedRoute>
            <EmergencyAccess />
          </ProtectedRoute>
        } />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

