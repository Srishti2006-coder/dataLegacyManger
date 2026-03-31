import React from "react";
import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  const handleBegin = () => {
    navigate("/login")
  };

  const handleLearn = () => {
    document.getElementById("features")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  return (
    <section className="hero-section">
      <div className="particles-bg"></div>
      
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-heading">
            <span className="heading-line gradient-text">Your Digital Life</span>
            <span className="heading-line gradient-text-sub">Deserves a Future</span>
          </h1>

          <p className="hero-subtext">
            Organize your digital assets, protect your accounts,
            <br className="mobile-break" />
            <span className="gradient-subtext"> and create a secure digital legacy with the help of AI.</span>
          </p>

          <div className="hero-buttons">
            <button className="btn-primary hero-btn" onClick={handleBegin}>
              <span>Begin Now</span>
              <div className="ripple"></div>
            </button>

            <button className="btn-secondary hero-btn" onClick={handleLearn}>
              <span>Learn More</span>
              <div className="ripple"></div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
