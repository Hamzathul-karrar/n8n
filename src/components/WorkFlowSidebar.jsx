import { Paper, List, ListItem, ListItemText, ListItemIcon, Typography, TextField } from '@mui/material';
import {
  Http,
  TouchApp,
  Code,
  SmartToy,
  Search,
  TableChart,
  Chat
} from '@mui/icons-material';
import { useState } from 'react';

const nodeTypes = [
  { 
    type: 'HTTP Request', 
    icon: Http,
    description: 'Make HTTP requests to external APIs and services'
  },
  { 
    type: 'Click Trigger', 
    icon: TouchApp,
    description: 'Trigger workflows with a button click'
  },
  { 
    type: 'Code', 
    icon: Code,
    description: 'Execute custom JavaScript code'
  },
  { 
    type: 'Chat Bot', 
    icon: SmartToy,
    description: 'Process conversations with AI'
  },
  { 
    type: 'Chat Trigger', 
    icon: Chat,
    description: 'Trigger chat-based workflows'
  },
  { 
    type: 'Microsoft Excel', 
    icon: TableChart,
    description: 'Store and process Excel data'
  },
  { 
    type: 'AI Scraper', 
    icon: Search,
    description: 'Scrape and process data using AI'
  }
];

export default function WorkflowSidebar() {
  const [searchQuery, setSearchQuery] = useState('');

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredNodes = nodeTypes.filter(node =>
    node.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search nodes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          margin: '16px',
          width: 'calc(100% - 32px)',
          '& .MuiOutlinedInput-root': {
            color: '#fff',
            '& fieldset': { borderColor: '#444' },
            '&:hover fieldset': { borderColor: '#ff6d5a' },
            '&.Mui-focused fieldset': { borderColor: '#ff6d5a' },
          },
          '& .MuiOutlinedInput-input': {
            '&::placeholder': {
              color: '#aaa',
              opacity: 1,
            },
          },
        }}
      />

      <List>
        {filteredNodes.map((node) => {
          const Icon = node.icon;
          return (
            <ListItem
              key={node.type}
              button
              draggable
              onDragStart={(event) => onDragStart(event, node.type)}
              sx={{
                cursor: 'grab',
                margin: '8px 0px',
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
                secondary={node.description}
                sx={{ 
                  '& .MuiListItemText-primary': { color: '#fff' },
                  '& .MuiListItemText-secondary': {
                    color: '#aaa',
                    fontSize: '0.8rem'
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
