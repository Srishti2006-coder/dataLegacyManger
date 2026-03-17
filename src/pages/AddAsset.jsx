
import { useState, useEffect, useRef, useCallback } from "react";
import { auth, db } from "../services/firebase";
import { encryptField } from "../services/encryption";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Sidebar from "../layout/Sidebar";

function AddAsset() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [rawData, setRawData] = useState("");
  const [fields, setFields] = useState([
    { name: "Identifier", value: "" },
    { name: "Password/Security Info", value: "" },
    { name: "Notes", value: "" }
  ]);
  const [category, setCategory] = useState("password");
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [scanPreview, setScanPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isHovering, setIsHovering] = useState(false);

  const dropdownRef = useRef(null);

  const categories = [
    { value: "password", label: "Password/Credentials", icon: "🔐" },
    { value: "email", label: "Email Accounts", icon: "📧" },
    { value: "financial", label: "Banking & Finance", icon: "🏦" },
    { value: "crypto", label: "Cryptocurrency & Wallets", icon: "₿" },
    { value: "social", label: "Social Media", icon: "📱" },
    { value: "cloud", label: "Cloud Storage", icon: "☁️" },
    { value: "streaming", label: "Streaming Services", icon: "🎬" },
    { value: "shopping", label: "Shopping & Retail", icon: "🛒" },
    { value: "professional", label: "Professional & Work", icon: "💼" },
    { value: "health", label: "Health & Medical", icon: "🏥" },
    { value: "government", label: "Government & Tax", icon: "🏛️" },
    { value: "gaming", label: "Gaming Accounts", icon: "🎮" },
    { value: "communication", label: "Communication", icon: "💬" },
    { value: "security", label: "Security & 2FA", icon: "🛡️" },
    { value: "insurance", label: "Insurance", icon: "📋" },
    { value: "real-estate", label: "Real Estate", icon: "🏠" },
    { value: "education", label: "Education", icon: "🎓" },
    { value: "travel", label: "Travel & Loyalty", icon: "✈️" },
    { value: "utilities", label: "Utilities", icon: "⚡" },
    { value: "subscriptions", label: "Subscriptions", icon: "📺" },
    { value: "personal", label: "Personal Documents", icon: "📄" },
    { value: "other", label: "Other", icon: "📦" },
    { value: "custom", label: "Custom Category...", icon: "✏️" }
  ];

  const selectedCategory = categories.find(c => c.value === category) || categories[0];

  // Dynamic field templates based on title keywords
  const assetFieldTemplates = {
    instagram: ["Username", "Password", "Notes"],
    "hospital payment": ["Hospital Name", "Receipt Number", "Date", "Notes"],
    "university email": ["Name", "Email", "Roll Number", "Notes"],
    "bank account": ["Account Number", "Bank Name", "IFSC", "Password/Pin", "Notes"],
    default: ["Identifier", "Password/Security Info", "Notes"]
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update fields dynamically when title changes
  useEffect(() => {
    const lowerRaw = title.toLowerCase();
    let template = assetFieldTemplates.default;
if (lowerRaw.includes("instagram")) template = assetFieldTemplates.instagram;
else if (lowerRaw.includes("hospital") || lowerRaw.includes("receipt")) template = assetFieldTemplates["hospital payment"];
else if (lowerRaw.includes("university") || lowerRaw.includes("college") || lowerRaw.includes("roll")) template = assetFieldTemplates["university email"];
else if (lowerRaw.includes("bank") || lowerRaw.includes("paypal") || lowerRaw.includes("account")) template = assetFieldTemplates["bank account"];

    setFields(template.map(f => ({ name: f, value: "" })));
  }, [title]);

  // AI scan raw data
  const handleScanAssets = useCallback(() => {
    if (!rawData.trim()) return setError("Please paste raw data first");

    const previewParts = [];
    const updatedFields = fields.map(f => {
      let val = f.value;

      // Simple regex auto-fill
      if (f.name.toLowerCase().includes("email")) {
        const emailMatch = rawData.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) { val = emailMatch[0]; previewParts.push(`Email: ${val}`); }
      }
      if (f.name.toLowerCase().includes("username")) {
        const userMatch = rawData.match(/username[:=]\s*([^\s]+)/i);
        if (userMatch) { val = userMatch[1]; previewParts.push(`Username: ${val}`); }
      }
      if (f.name.toLowerCase().includes("password") || f.name.toLowerCase().includes("pin")) {
        const pwMatch = rawData.match(/(?:pw|pass|password|pin)[:=\s]*([a-zA-Z0-9@$!%*?&]{4,})/i);
        if (pwMatch) { val = pwMatch[1]; previewParts.push(`Password: ${val.substring(0,4)}****`); }
      }
      if (f.name.toLowerCase().includes("receipt")) {
        const recMatch = rawData.match(/receipt[:=\s]*([^\s]+)/i);
        if (recMatch) { val = recMatch[1]; previewParts.push(`Receipt: ${val}`); }
      }
      if (f.name.toLowerCase().includes("hospital")) {
        const hospMatch = rawData.match(/hospital[:=\s]*([^\n]+)/i);
        if (hospMatch) { val = hospMatch[1]; previewParts.push(`Hospital: ${val}`); }
      }
      if (f.name.toLowerCase().includes("roll")) {
        const rollMatch = rawData.match(/roll[:=\s]*([^\s]+)/i);
        if (rollMatch) { val = rollMatch[1]; previewParts.push(`Roll: ${val}`); }
      }
      return { ...f, value: val };
    });

    setFields(updatedFields);
    setScanPreview(previewParts.join("\n"));
    setSuccess("✅ Scan complete!");
    setError("");
  }, [rawData, fields]);

  // Add asset
  const handleAddAsset = useCallback(async () => {
    if (!auth.currentUser) {
      setError("You must be logged in to add an asset. Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    if (!title || fields.every(f=>!f.value)) {
      setError("Please fill the title and at least one field");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Encrypt all fields
      const encryptedFields = await Promise.all(fields.map(async f => {
        let enc = "";
        try { enc = encryptField(f.value, auth.currentUser.email); } 
        catch { enc = "[Encryption Failed]"; }
        return { fieldName: f.name, encryptedValue: enc };
      }));

      await addDoc(collection(db, "assets"), {
        userId: auth.currentUser.uid,
        title,
        fields: encryptedFields,
        category,
        createdAt: serverTimestamp()
      });

      setSuccess("Asset saved successfully!");
      setTimeout(() => {
        setTitle(""); setRawData(""); setFields([]);
        navigate("/view-assets");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }, [title, fields, category, navigate]);

  return (
    <div style={{ display: "flex", background: "#121226", minHeight: "100vh", color: "white" }}>
      <Sidebar />
      <div style={{ marginLeft: "260px", padding: "40px", width: "100%" }}>
        <h1 style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "10px" }}>Add Digital Asset</h1>
        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "1.1rem" }}>Securely store your important digital information</p>

        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px", borderRadius: "20px", background: "#1e293b" }}>
          {/* Title */}
          <div style={{ marginBottom: "25px" }}>
            <label>Asset Title *</label>
            <input type="text" placeholder="Gmail, Bank Login..." value={title} onChange={e=>setTitle(e.target.value)} style={{ width:"100%", padding:"15px", borderRadius:"10px", border:"2px solid #475569", background:"#1a1a2e", color:"white" }}/>
          </div>

          {/* AI Scan */}
          <div style={{ marginBottom: "25px" }}>
            <button type="button" onClick={()=>setShowAdvanced(!showAdvanced)} style={{ padding:"10px", fontSize:"14px", background:showAdvanced?"#ef4444":"#10b981" }}>
              {showAdvanced ? "Hide" : "🚀 AI Scan Assets (Advanced)"}
            </button>
            {showAdvanced && (
              <div style={{ marginTop:"10px" }}>
                <textarea placeholder="Paste raw data here..." value={rawData} onChange={e=>setRawData(e.target.value)} style={{ width:"100%", padding:"15px", borderRadius:"10px", border:"2px solid #475569", background:"#1a1a2e", color:"white", minHeight:"100px" }}/>
                <button onClick={handleScanAssets} style={{ marginTop:"10px", padding:"10px", background:"orange" }}>✨ Scan & Auto-fill</button>
                {scanPreview && <pre style={{ color:"#94a3b8", marginTop:"10px", whiteSpace:"pre-wrap" }}>{scanPreview}</pre>}
              </div>
            )}
          </div>

          {/* Dynamic Fields */}
          {fields.map((f, idx)=>(
            <div style={{ marginBottom:"25px" }} key={idx}>
              <label>{f.name}</label>
              <input type="text" placeholder={`Enter ${f.name}`} value={f.value} onChange={e=>{
                const newFields = [...fields]; newFields[idx].value = e.target.value; setFields(newFields);
              }} style={{ width:"100%", padding:"15px", borderRadius:"10px", border:"2px solid #475569", background:"#1a1a2e", color:"white" }}/>
            </div>
          ))}

          {/* Category */}
          <div style={{ marginBottom:"25px" }} ref={dropdownRef}>
            <label>Category</label>
            <button type="button" onClick={()=>setIsDropdownOpen(!isDropdownOpen)} style={{ width:"100%", padding:"15px", borderRadius:"10px", border:"2px solid #475569", background:"#1a1a2e", color:"white", textAlign:"left", display:"flex", alignItems:"center" }}>
              <span style={{marginRight:"10px"}}>{selectedCategory.icon}</span>
              <span>{selectedCategory.label}</span>
              <span style={{ marginLeft:"auto" }}>▼</span>
            </button>
            {isDropdownOpen && (
              <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"#1a1a2e", border:"2px solid #475569", borderRadius:"10px", maxHeight:"200px", overflowY:"auto", zIndex:1000 }}>
                {categories.map(cat=>(<div key={cat.value} style={{ padding:"12px 15px", display:"flex", alignItems:"center", cursor:"pointer", borderBottom:"1px solid #475569"}} onClick={()=>{
                  if(cat.value==='custom'){ setIsCustomMode(true); setIsDropdownOpen(false); } 
                  else { setCategory(cat.value); setIsCustomMode(false); setCustomCategoryInput(''); setIsDropdownOpen(false); }
                }}>
                  <span style={{marginRight:"10px"}}>{cat.icon}</span><span>{cat.label}</span>
                </div>))}
              </div>
            )}
            {isCustomMode && <input type="text" placeholder="Type your custom category..." value={customCategoryInput} onChange={e=>setCustomCategoryInput(e.target.value)} onKeyDown={e=>{
              if(e.key==='Enter' && e.target.value.trim()){
                setCategory(`custom-${e.target.value.trim().toLowerCase().replace(/\s+/g,'-')}`);
                setIsCustomMode(false); setCustomCategoryInput(''); setIsDropdownOpen(false);
              }
            }} autoFocus style={{ marginTop:"10px", width:"100%", padding:"15px", borderRadius:"10px", border:"2px solid #475569", background:"#1a1a2e", color:"white"}} />}
          </div>

          {/* Messages */}
          {error && <div style={{ color:"#ef4444", background:"rgba(239,68,68,0.1)", padding:"12px", borderRadius:"8px", marginBottom:"20px", textAlign:"center"}}>{error}</div>}
          {success && <div style={{ color:"#10b981", background:"rgba(16,185,129,0.1)", padding:"12px", borderRadius:"8px", marginBottom:"20px", textAlign:"center"}}>{success}</div>}

          {/* Save Button */}
          <button onClick={handleAddAsset} disabled={loading} style={{ width:"100%", padding:"15px", background:"#6366f1", color:"white", border:"none", borderRadius:"10px", fontSize:"18px", fontWeight:"bold", cursor: loading ? "not-allowed":"pointer", transform: isHovering?"scale(1.02)":"none"}} onMouseEnter={()=>!loading && setIsHovering(true)} onMouseLeave={()=>setIsHovering(false)}>
            {loading ? "Saving Asset..." : "Save Digital Asset"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddAsset;