
import React from "react";
import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const handleLogin = () => {
    // temporary login
    navigate("/dashboard");
  };

  return (
    <div style={styles.container}>

      <h2 style={styles.title}>Login</h2>

      <input
        type="email"
        placeholder="Email"
        style={styles.input}
      />

      <input
        type="password"
        placeholder="Password"
        style={styles.input}
      />

      <button style={styles.button} onClick={handleLogin}>
        Login
      </button>

      <p style={styles.text}>
        Don't have an account? Sign up
      </p>

    </div>
  );
}

const styles = {

  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f9fafc"
  },

  title: {
    fontSize: "2rem",
    marginBottom: "30px"
  },

  input: {
    width: "280px",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },

  button: {
    width: "280px",
    padding: "12px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },

  text: {
    marginTop: "15px",
    color: "#6b7280"
  }

};

export default Login;