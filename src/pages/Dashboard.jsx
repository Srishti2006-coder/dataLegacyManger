import Sidebar from "../layout/Sidebar";
import { auth, db } from "../services/firebase";
import VaultAIChatbot from "../components/VaultAIChatbot";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";

function Dashboard() {

  const navigate = useNavigate();
  const user = auth.currentUser;
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalNominees, setTotalNominees] = useState(0);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "assets"), where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setTotalAssets(querySnapshot.size);
      });

      return unsubscribe; // Cleanup on unmount
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "nominees"), where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        setTotalNominees(querySnapshot.size);
      });

      return unsubscribe; // Cleanup on unmount
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", background: "#020617", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ marginLeft: "260px", padding: "40px", color: "white", width: "100%" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#ffffff' }}>Dashboard</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Welcome {user?.email}</p>
          </div>
          <button style={{ padding: '12px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }} onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr)', gap: '20px', marginBottom: '40px' }}>
          <div
            style={{ padding: '30px', background: 'linear-gradient(145deg, #1e293b, #334155)', borderRadius: '20px', cursor: 'pointer', border: '1px solid #475569', transition: 'transform 0.3s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => navigate("/add-asset")}
          >
            <h3 style={{ color: '#10b981', marginBottom: '10px' }}>Add Asset</h3>
            <p style={{ color: '#94a3b8' }}>Store your digital credentials securely</p>
          </div>

          <div
            style={{ padding: '30px', background: 'linear-gradient(145deg, #1e293b, #334155)', borderRadius: '20px', cursor: 'pointer', border: '1px solid #475569', transition: 'transform 0.3s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => navigate("/view-assets")}
          >
            <h3 style={{ color: '#10b981', marginBottom: '10px' }}>View Assets</h3>
            <p style={{ color: '#94a3b8' }}>Access your saved digital assets</p>
          </div>

          <div
            style={{ padding: '30px', background: 'linear-gradient(145deg, #1e293b, #334155)', borderRadius: '20px', cursor: 'pointer', border: '1px solid #475569', transition: 'transform 0.3s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => navigate("/nominee")}
          >
            <h3 style={{ color: '#10b981', marginBottom: '10px' }}>Set Nominee</h3>
            <p style={{ color: '#94a3b8' }}>Assign trusted person for access</p>
          </div>

        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)', gap: '20px', marginBottom: '40px' }}>
          <div style={{ padding: '30px', background: 'linear-gradient(145deg, #1e293b, #334155)', borderRadius: '20px', textAlign: 'center', border: '1px solid #475569' }}>
            <div style={{ fontSize: '3rem', color: '#6366f1', fontWeight: 'bold' }}>{totalAssets}</div>
            <div style={{ color: '#94a3b8', fontSize: '1rem' }}>Total Assets</div>
          </div>
          <div style={{ padding: '30px', background: 'linear-gradient(145deg, #1e293b, #334155)', borderRadius: '20px', textAlign: 'center', border: '1px solid #475569' }}>
            <div style={{ fontSize: '3rem', color: '#6366f1', fontWeight: 'bold' }}>21</div>
            <div style={{ color: '#94a3b8', fontSize: '1rem' }}>Categories</div>
          </div>
          <div style={{ padding: '30px', background: 'linear-gradient(145deg, #1e293b, #334155)', borderRadius: '20px', textAlign: 'center', border: '1px solid #475569' }}>
            <div style={{ fontSize: '3rem', color: '#6366f1', fontWeight: 'bold' }}>{totalNominees}</div>
            <div style={{ color: '#94a3b8', fontSize: '1rem' }}>Nominees Set</div>
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '20px' }}>Quick Tips to Get Started</h3>
          <ul style={{ color: '#94a3b8', lineHeight: '1.8' }}>
            <li>Start by adding your most important digital assets like passwords and accounts.</li>
            <li>Set up a nominee to ensure your digital legacy is properly managed.</li>
            <li>Regularly review and update your stored information for security.</li>
            <li>Use strong, unique passwords for all your accounts.</li>
            <li>Consider enabling two-factor authentication wherever possible.</li>
          </ul>
        </div>

      </div>
      {/* 🤖 AI Vault Assistant */}
      <VaultAIChatbot />
    </div>
  );
}

export default Dashboard;
