import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

function Landing() {
  return (
    <div className="landing-container">
      <Navbar />

      <Hero />

      {/* Features Section */}
      <section className="features-section" id="features">
        <h2 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>
          Powerful Features
        </h2>
        <p style={{ color: "#94a3b8", maxWidth: "600px", margin: "0 auto 60px" }}>
          Secure your digital assets and plan your legacy with AI-powered tools designed for the future.
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Vault</h3>
            <p>Store and manage your digital legacy with military-grade encryption.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered</h3>
            <p>Leverage artificial intelligence to organize and optimize your assets.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Analytics</h3>
            <p>Get insights into your digital footprint with comprehensive analytics.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Cloud Integration</h3>
            <p>Seamlessly integrate with cloud services for enhanced accessibility.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast & Reliable</h3>
            <p>Experience lightning-fast performance with our optimized infrastructure.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Privacy First</h3>
            <p>Your data privacy is our top priority, with zero-knowledge architecture.</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <h2 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>About LegacyAI</h2>
        <p style={{ color: "#94a3b8", maxWidth: "800px", margin: "0 auto", fontSize: "1.2rem" }}>
          LegacyAI is revolutionizing how we manage and preserve our digital legacies. Our platform combines
          cutting-edge AI technology with robust security measures to ensure your digital assets are protected
          and accessible for generations to come.
        </p>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <h2 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>Ready to Secure Your Legacy?</h2>
        <p style={{ color: "#e2e8f0", maxWidth: "600px", margin: "0 auto 40px", fontSize: "1.2rem" }}>
          Join thousands of users who trust LegacyAI to manage their digital future.
        </p>
        <a href="#signup" className="btn-primary enhanced-cta">Get Started Today</a>
      </section>
    </div>
  );
}

export default Landing;