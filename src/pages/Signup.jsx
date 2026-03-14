import { useState } from "react";
import { auth, db } from "../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Signup(){

const navigate = useNavigate();

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const handleSignup = async () => {

try{

const userCredential = await createUserWithEmailAndPassword(auth,email,password);

const user = userCredential.user;

await setDoc(doc(db,"users",user.uid),{
email:user.email,
createdAt:serverTimestamp()
});

alert("Account created");

navigate("/login");

}
catch(error){
alert(error.message);
}

};

return(

<div style={{textAlign:"center", marginTop:"100px"}}>

<h2>Signup</h2>

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

<button onClick={handleSignup}>
Create Account
</button>

<br/><br/>

{/* Login link added */}
<p>
Already have an account? 
<a href="/login" style={{color:"blue"}}> Login</a>
</p>

</div>

);

}

export default Signup;