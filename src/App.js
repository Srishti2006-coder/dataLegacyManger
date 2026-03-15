import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

import AddAsset from "./pages/AddAsset";
import ViewAssets from "./pages/ViewAssets";
import Nominee from "./pages/Nominee";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Vault from "./pages/Vault";
import Will from "./pages/Will";
import NomineeVerify from "./pages/NomineeVerify";
import EmergencyAccess from "./pages/EmergencyAccess";

function App() {

return(

<Router>

<Routes>

<Route path="/" element={<Landing />} />

<Route path="/login" element={<Login />} />

<Route path="/signup" element={<Signup />} />

<Route path="/dashboard" element={<Dashboard />} />

<Route path="/add-asset" element={<AddAsset />} />

<Route path="/view-assets" element={<ViewAssets />} />

<Route path="/nominee" element={<Nominee />} />

<Route path="/profile" element={<Profile />} />

<Route path="/settings" element={<Settings />} />

<Route path="/vault" element={<Vault />} />

<Route path="/will" element={<Will />} />
        <Route path="/nominee-verify" element={<NomineeVerify />} />
        <Route path="/emergency-access" element={<EmergencyAccess />} />

</Routes>

</Router>

);

}

export default App;