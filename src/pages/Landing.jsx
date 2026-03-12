import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

function Landing() {
  return (
    <div>
      <Navbar />

      <Hero />

      {/* Features Section */}
      <div
        id="features"
        style={{
          padding: "100px",
          textAlign: "center",
          background: "#f9fafc"
        }}
      >
        <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>
          Powerful Features
        </h2>

        <p style={{ color: "#6b7280" }}>
          Secure your digital assets and plan your legacy with AI-powered tools.
        </p>
      </div>
    </div>
  );
}

export default Landing;