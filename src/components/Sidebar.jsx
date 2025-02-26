import { Paper, List, ListItem, ListItemText, ListItemIcon, Typography } from '@mui/material';
import {
  Http,
  Schedule,
  Code,
  Email,
  Storage,
  Functions,
  CloudQueue,
} from '@mui/icons-material';

const nodeTypes = [
  { type: 'HTTP Request', icon: Http },
  { type: 'Schedule Trigger', icon: Schedule },
  { type: 'JavaScript', icon: Code },
  { type: 'Email', icon: Email },
  { type: 'Database', icon: Storage },
  { type: 'Function', icon: Functions },
  { type: 'API', icon: CloudQueue },
];

export default function Sidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

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
