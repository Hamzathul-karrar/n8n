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
    <Paper 
      elevation={3}
      sx={{
        width: 250,
        height: '100%',
        overflow: 'auto',
        borderRadius: 0,
        backgroundColor: '#2a2a2a',
        borderRight: '1px solid #444',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          padding: '16px',
          borderBottom: '1px solid #444',
          backgroundColor: '#2a2a2a',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        Nodes
      </Typography>
      
      <List>
        {nodeTypes.map((node) => {
          const Icon = node.icon;
          return (
            <ListItem
              key={node.type}
              button
              draggable
              onDragStart={(event) => onDragStart(event, node.type)}
              sx={{
                cursor: 'grab',
                margin: '8px',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 109, 90, 0.08)',
                  borderColor: '#ff6d5a',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#ff6d5a' }}>
                <Icon />
              </ListItemIcon>
              <ListItemText 
                primary={node.type} 
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    color: '#fff'
                  }
                }} 
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
} 