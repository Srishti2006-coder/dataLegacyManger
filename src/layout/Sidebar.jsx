
import React from "react";

function Sidebar() {
  return (
    <div style={styles.sidebar}>
      
      <h2 style={styles.logo}>
        Legacy<span style={styles.ai}>AI</span>
      </h2>

      <ul style={styles.menu}>
        <li>Dashboard</li>
        <li>Vault</li>
        <li>Digital Will</li>
      </ul>

    </div>
  );
}

const styles = {

  sidebar: {
    width: "220px",
    height: "100vh",
    background: "#111827",
    color: "white",
    padding: "30px 20px",
    position: "fixed"
  },

  logo: {
    marginBottom: "40px"
  },

  ai: {
    color: "#6366f1"
  },

  menu: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    cursor: "pointer"
  }

};

export default Sidebar;