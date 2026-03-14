import { useState } from "react";
import { auth, db } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Sidebar from "../layout/Sidebar";

function AddAsset(){

const navigate = useNavigate();

const [title,setTitle] = useState("");
const [username,setUsername] = useState("");
const [password,setPassword] = useState("");
const [notes,setNotes] = useState("");

const handleAddAsset = async () => {

try{

await addDoc(collection(db,"assets"),{

userId: auth.currentUser.uid,
title:title,
username:username,
password:password,
notes:notes,
createdAt:serverTimestamp()

});

alert("Asset saved successfully");

navigate("/view-assets");

}
catch(error){
alert(error.message);
}

};

return(

<div style={styles.container}>

<Sidebar/>

<div style={styles.main}>

<h2>Add Digital Asset</h2>

<input
style={styles.input}
placeholder="Asset Title"
onChange={(e)=>setTitle(e.target.value)}
/>

<input
style={styles.input}
placeholder="Username / Email"
onChange={(e)=>setUsername(e.target.value)}
/>

<input
style={styles.input}
placeholder="Password"
onChange={(e)=>setPassword(e.target.value)}
/>

<textarea
style={styles.input}
placeholder="Notes"
onChange={(e)=>setNotes(e.target.value)}
/>

<button
style={styles.button}
onClick={handleAddAsset}
>
Save Asset
</button>

</div>

</div>

);

}

const styles={

container:{
display:"flex",
background:"#020617",
minHeight:"100vh",
color:"white"
},

main:{
marginLeft:"220px",
padding:"40px",
width:"100%"
},

input:{
display:"block",
margin:"15px 0",
padding:"12px",
width:"300px",
borderRadius:"8px",
border:"none"
},

button:{
padding:"12px 20px",
background:"#6366f1",
border:"none",
borderRadius:"8px",
color:"white",
cursor:"pointer"
}

};

export default AddAsset;