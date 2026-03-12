import React from "react";
import Sidebar from "../layout/Sidebar";

function Dashboard() {
  return (
    <div>
      <Sidebar />
      <div style={{marginLeft:"240px", padding:"40px"}}>
        <h1>Dashboard</h1>
      </div>
    </div>
  );
}

export default Dashboard;