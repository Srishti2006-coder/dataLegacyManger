
import { useState } from "react";
import { auth } from "../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = async () => {

    try{
      await signInWithEmailAndPassword(auth,email,password);
      alert("Login successful");

      navigate("/dashboard");
    }
    catch(error){
      alert(error.message);
    }

  };

  return (

    <div style={{textAlign:"center", marginTop:"100px"}}>

      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e)=>setEmail(e.target.value)}
      />

      <br/><br/>

      <input
        type="password"
        placeholder="Password"
        onChange={(e)=>setPassword(e.target.value)}
      />

      <br/><br/>

      <button onClick={handleLogin}>
        Login
      </button>

      <br/><br/>

      {/* Signup link added */}
      <p>
        Don't have an account? 
        <a href="/signup" style={{color:"blue"}}> Signup</a>
      </p>

    </div>

  );
}

export default Login;