import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Sidebar from "../layout/Sidebar";

function ViewAssets(){

const [assets,setAssets] = useState([]);

useEffect(()=>{

const fetchAssets = async () => {

const q = query(
collection(db,"assets"),
where("userId","==",auth.currentUser.uid)
);

const querySnapshot = await getDocs(q);

let data=[];

querySnapshot.forEach((doc)=>{
data.push({id:doc.id,...doc.data()});
});

setAssets(data);

};

fetchAssets();

},[]);

return(

<div style={styles.container}>

<Sidebar/>

<div style={styles.main}>

<h2>Your Assets</h2>

{assets.map((asset)=>(
<div key={asset.id} style={styles.card}>

<h3>{asset.title}</h3>

<p>Username: {asset.username}</p>

<p>Password: {asset.password}</p>

<p>Notes: {asset.notes}</p>

</div>
))}

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

card:{
background:"#1e293b",
padding:"20px",
marginTop:"20px",
borderRadius:"10px",
width:"350px"
}

};

export default ViewAssets;