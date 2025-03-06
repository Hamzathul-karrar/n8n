import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import WorkflowEditor from "./components/WorkflowEditor";
import Login from "./Forms/Login";
import SignUp from "./Forms/SignUp";
import "./styles/global.css";
import "./styles/dashboard.css";
import { handleParentExpand } from "reactflow";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("isAuthenticated") === "true"
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem("isAuthenticated", "true");
  };
  
  const handleLogout = () => {
   setIsAuthenticated(false);
   sessionStorage.removeItem("isAuthenticated");
  };
  
  return (
    <Router>
      <Routes>
        {/* Show Login page by default */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Redirect to Login if not authenticated */}
        <Route
          path="/workflow/:id"
          element={isAuthenticated ? <WorkflowEditor /> : <Navigate to="/login" />}
        />

        {/* Protect Dashboard routes */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <div className="app-container">
                <Sidebar />
                <div className="main-container">
                  <Routes>
                    <Route path="/" element={<Dashboard section="overview" />} />
                    <Route path="/admin" element={<Dashboard section="admin" />} />
                  </Routes>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
