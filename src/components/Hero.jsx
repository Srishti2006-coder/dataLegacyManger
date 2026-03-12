
import React from "react";
import { useNavigate } from "react-router-dom";

function Hero() {

  const navigate = useNavigate();

  const handleBegin = () => {
    navigate("/dashboard");
  };

  const handleLearn = () => {
    document.getElementById("features")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  return (
    <section style={styles.hero}>
      
      <div style={styles.container}>
        
        <h1 style={styles.heading}>
          Your Digital Life Deserves a Future
        </h1>

        <p style={styles.subtext}>
          Organize your digital assets, protect your accounts,
          and create a secure digital legacy with the help of AI.
        </p>

        <div style={styles.buttons}>
          <button style={styles.primaryBtn} onClick={handleBegin}>
            Begin Now
          </button>

          <button style={styles.secondaryBtn} onClick={handleLearn}>
            Learn More
          </button>
        </div>

      </div>

    </section>
  );
}

const styles = {
  hero: {
    minHeight: "90vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    background: "linear-gradient(135deg,#f9fafc,#eef2ff)"
  },

  container: {
    maxWidth: "800px",
    padding: "20px"
  },

  heading: {
    fontSize: "3rem",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "20px"
  },

  subtext: {
    fontSize: "1.2rem",
    color: "#6b7280",
    marginBottom: "30px"
  },

  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap"
  },

  primaryBtn: {
    padding: "14px 28px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer"
  },

  secondaryBtn: {
    padding: "14px 28px",
    border: "1px solid #4f46e5",
    borderRadius: "8px",
    background: "white",
    color: "#4f46e5",
    fontSize: "16px",
    cursor: "pointer"
  }
};

export default Hero;