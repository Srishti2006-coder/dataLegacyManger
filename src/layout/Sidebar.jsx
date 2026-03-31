
import { useNavigate } from "react-router-dom";
import './Sidebar.css';

function Sidebar() {

  const navigate = useNavigate();

  return (

    <div className="sidebar-container">

      <h2 className="sidebar-logo">LegacyAI</h2>

      <button className="sidebar-link" onClick={() => navigate("/dashboard")}>
        Dashboard
      </button>

      <button className="sidebar-link" onClick={() => navigate("/add-asset")}>
        Add Asset
      </button>

      <button className="sidebar-link" onClick={() => navigate("/view-assets")}>
        View Assets
      </button>

      <button className="sidebar-link" onClick={() => navigate("/nominee")}>
        Nominee
      </button>

      <button className="sidebar-link" onClick={() => navigate("/profile")}>
        Profile
      </button>

      <button className="sidebar-link" onClick={() => navigate("/settings")}>
        Settings
      </button>

    </div>

  );
}

export default Sidebar;