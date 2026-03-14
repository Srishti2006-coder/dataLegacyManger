
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
      
      <div className="hero-container">
        
        <h1 className="hero-heading">
          Your Digital Life Deserves a Future
        </h1>

        <p className="hero-subtext">
          Organize your digital assets, protect your accounts,
          and create a secure digital legacy with the help of AI.
        </p>

        <div className="hero-buttons">
          <button className="btn-primary" onClick={handleBegin}>
            Begin Now
          </button>

          <button className="btn-secondary" onClick={handleLearn}>
            Learn More
          </button>
        </div>

      </div>

    </section>
  );
}

export default Hero;