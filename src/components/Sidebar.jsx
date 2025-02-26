import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h1>AI-AGENT</h1>
      <NavLink to="/" className={({ isActive }) => (isActive ? "active-link" : "")}>
        Overview
      </NavLink>
      <NavLink to="/admin" className={({ isActive }) => (isActive ? "active-link" : "")}>
        Admin
      </NavLink>
    </div>
  );
};

// export default Sidebar;
