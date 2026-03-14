import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Vault from "./pages/Vault";
import Will from "./pages/Will";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/will" element={<Will />} />

      </Routes>
    </Router>
  );
}

export default App;