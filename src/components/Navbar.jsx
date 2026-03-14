
function Navbar() {
  return (
    <nav
      style={{
        background: "#020617",
        borderBottom: "1px solid #1e293b",
        color: "white",
        padding: "20px 60px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <h2 style={{ margin: 0 }}>
        Legacy<span style={{ color: "#6366f1" }}>AI</span>
      </h2>
    </nav>
  );
}

export default Navbar;