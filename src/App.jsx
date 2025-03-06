import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import WorkflowEditor from "./components/WorkflowEditor";
import Login from "./Forms/Login";
import SignUp from "./Forms/SignUp";
import "./styles/global.css";
import "./styles/dashboard.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in (sessionStorage or localStorage)
    const user = sessionStorage.getItem("user");
    setIsAuthenticated(!!user);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Show Login page by default */}
        <Route path="/login" element={<Login />} />
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
