

import Sidebar from "../layout/Sidebar";
import AIAssistant from "../components/AIAssistant";
import { auth, db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import "./Dashboard.css";
import "../components/DashboardCard.css";

function Dashboard() {

  const navigate = useNavigate();
  const user = auth.currentUser;
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalNominees, setTotalNominees] = useState(0);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "assets"), where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        try {
          setTotalAssets(querySnapshot.size);
        } catch (error) {
          console.error("Error updating assets count:", error);
        }
      });

      return unsubscribe; // Cleanup on unmount
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "nominees"), where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        try {
          setTotalNominees(querySnapshot.size);
        } catch (error) {
          console.error("Error updating nominees count:", error);
        }
      });

      return unsubscribe; // Cleanup on unmount
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="dashboard-root">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
        <div className="dashboard-main">
          <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-user">Welcome {user?.email}</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="dashboard-grid">

          <div
            className="dashboard-card"
            onClick={() => navigate("/add-asset")}
          >
            <h3>Add Asset</h3>
            <p>Store your digital credentials securely</p>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/view-assets")}
          >
            <h3>View Assets</h3>
            <p>Access your saved digital assets</p>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/nominee")}
          >
            <h3>Set Nominee</h3>
            <p>Assign trusted person for access</p>
          </div>

        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-number">{totalAssets}</div>
            <div className="stat-label">Total Assets</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">3</div>
            <div className="stat-label">Categories</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{totalNominees}</div>
            <div className="stat-label">Nominees Set</div>
          </div>
        </div>

        <div className="dashboard-tips">
          <h3>Quick Tips to Get Started</h3>
          <ul>
            <li>Start by adding your most important digital assets like passwords and accounts.</li>
            <li>Set up a nominee to ensure your digital legacy is properly managed.</li>
            <li>Regularly review and update your stored information for security.</li>
            <li>Use strong, unique passwords for all your accounts.</li>
            <li>Consider enabling two-factor authentication wherever possible.</li>
          </ul>
        </div>

      </div>

        {/* AI Assistant */}
        <AIAssistant />

    </div>
  );
}

export default Dashboard;
