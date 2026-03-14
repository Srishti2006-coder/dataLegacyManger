
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Dashboard() {

  const navigate = useNavigate();

  const user = auth.currentUser;

  const handleLogout = async () => {

    await signOut(auth);

    navigate("/login");

  };

  return (

    <div style={styles.container}>

      <h1 style={styles.heading}>LegacyAI Dashboard</h1>

      <p style={styles.email}>
        Welcome {user?.email}
      </p>

      <div style={styles.grid}>

        <button
          style={styles.card}
          onClick={()=>navigate("/add-asset")}
        >
          Add Asset
        </button>

        <button
          style={styles.card}
          onClick={()=>navigate("/view-assets")}
        >
          View Assets
        </button>

        <button
          style={styles.card}
          onClick={()=>navigate("/nominee")}
        >
          Set Nominee
        </button>

      </div>

      <button
        style={styles.logout}
        onClick={handleLogout}
      >
        Logout
      </button>

    </div>

  );
}

const styles = {

container:{
minHeight:"100vh",
background:"#020617",
color:"white",
textAlign:"center",
paddingTop:"80px"
},

heading:{
fontSize:"2.5rem",
marginBottom:"10px"
},

email:{
color:"#94a3b8",
marginBottom:"40px"
},

grid:{
display:"flex",
justifyContent:"center",
gap:"30px",
flexWrap:"wrap"
},

card:{
padding:"30px",
width:"180px",
background:"#1e293b",
border:"1px solid #334155",
borderRadius:"12px",
color:"white",
fontSize:"16px",
cursor:"pointer"
},

logout:{
marginTop:"50px",
padding:"12px 25px",
background:"#ef4444",
border:"none",
borderRadius:"8px",
color:"white",
cursor:"pointer"
}

};

export default Dashboard;