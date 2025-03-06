// Import required dependencies
import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";

// Sidebar component that provides navigation links
const Sidebar = () => {
  return (
    <div className="sidebar">
      {/* Application title */}
      <h1>AI-AGENT</h1>
      
      {/* Navigation links with active state handling */}
      <NavLink to="/" className={({ isActive }) => (isActive ? "active-link" : "")}>
        Overview
      </NavLink>
      <NavLink to="/admin" className={({ isActive }) => (isActive ? "active-link" : "")}>
        Admin
      </NavLink>
      <NavLink to="/login" className={({ isActive }) => (isActive ? "active-link" : "")}>
        Logout
      </NavLink>
    </div>
  );
};

export default Sidebar;
