
import { useState } from "react";
import { analyzeVaultQuery } from "../services/firebase";

export default function VaultAIChatbot() {

const [open,setOpen] = useState(false);
const [input,setInput] = useState("");
const [messages,setMessages] = useState([
{sender:"ai",text:"Hello 👋 I'm your smart Vault AI. Ask naturally about assets, nominees, or verifications!"}
]);
const [loading,setLoading] = useState(false);

const sendMessage = async () => {

if(!input.trim() || loading) return;

const userMessage = {sender:"user",text:input};
setMessages(prev => [...prev,userMessage]);
setInput("");
setLoading(true);

try {
  const { data } = await analyzeVaultQuery({ message: input });
  const aiReply = data.success ? data.reply : data.reply;
  setMessages(prev => [...prev,{sender:"ai",text:aiReply}]);
} catch (err) {
  const errorReply = "Sorry, having trouble connecting to vault data. Try again!";
  setMessages(prev => [...prev,{sender:"ai",text:errorReply}]);
} finally {
  setLoading(false);
}

};


return(

<>

{/* Floating Button */}

<div
onClick={()=>setOpen(!open)}
style={{
position:"fixed",
bottom:"25px",
right:"25px",
background:"#5a6cff",
color:"white",
width:"60px",
height:"60px",
borderRadius:"50%",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:"28px",
cursor:"pointer",
boxShadow:"0 10px 25px rgba(0,0,0,0.4)",
zIndex:999
}}
>
🤖
</div>

{/* Chat Window */}

{open && (

<div style={{
position:"fixed",
bottom:"100px",
right:"25px",
width:"340px",
height:"420px",
background:"#1f2a3c",
borderRadius:"12px",
boxShadow:"0 20px 40px rgba(0,0,0,0.5)",
display:"flex",
flexDirection:"column",
overflow:"hidden",
zIndex:999
}}>

{/* Header */}

<div style={{
background:"#5a6cff",
padding:"12px",
color:"white",
fontWeight:"bold"
}}>
Vault AI Assistant
</div>

{/* Messages */}

<div style={{
flex:1,
padding:"10px",
overflowY:"auto",
fontSize:"14px"
}}>

{messages.map((msg,i)=>(
<div key={i}
style={{
textAlign: msg.sender==="user"?"right":"left",
marginBottom:"8px"
}}
>

<span style={{
background: msg.sender==="user"?"#5a6cff":"#2c3e55",
color:"white",
padding:"6px 10px",
borderRadius:"8px",
display:"inline-block",
maxWidth:"80%"
}}>
{msg.text}
</span>

</div>
))}

</div>

{/* Input */}

<div style={{
display:"flex",
borderTop:"1px solid #333"
}}>

<input
value={input}
onChange={(e)=>setInput(e.target.value)}
placeholder="Ask about your vault..."
style={{
flex:1,
padding:"10px",
border:"none",
outline:"none",
background:"#162033",
color:"white"
}}
/>

<button
onClick={sendMessage}
style={{
background:"#5a6cff",
border:"none",
padding:"10px 16px",
color:"white",
cursor:"pointer"
}}
>
Send
</button>

</div>

</div>

)}

</>

)

}