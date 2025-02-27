import { Paper, List, ListItem, ListItemText, ListItemIcon, Typography, TextField } from '@mui/material';
import {
  Http,
  Schedule,
  Code,
  Email,
  Storage,
  Functions,
  CloudQueue,
  SmartToy,  // Chatbot icon
  Search,    // AI Scraper icon
  TableChart // Excel Sheet icon
} from '@mui/icons-material';
import { useState } from 'react';

// Define an array of node types with their properties (type, icon, and description)
// This serves as the data source for the sidebar's draggable nodes
const nodeTypes = [
  { 
    type: 'Chatbot', 
    icon: SmartToy,
    description: 'Interact with users and process conversations'
  },
  { 
    type: 'AI Scraper', 
    icon: Search,
    description: 'Scrape business data based on user input'
  },
  { 
    type: 'HTTP Request', 
    icon: Http,
    description: 'Make HTTP requests to external APIs and services'
  },
  { 
    type: 'Click Trigger', 
    icon: Schedule,
    description: 'Trigger workflows with a test button click'
  },
  { 
    type: 'Microsoft Excel', 
    icon: TableChart,
    description: 'Store scraped data in an Excel file'
  },
  { 
    type: 'Code', 
    icon: Code,
    description: 'Execute custom JavaScript Code'
  },
  { 
    type: 'Email', 
    icon: Email,
    description: 'Send and process email communications'
  },
  { 
    type: 'Database', 
    icon: Storage,
    description: 'Interact with databases and storage systems'
  },
  { 
    type: 'Function', 
    icon: Functions,
    description: 'Create custom function nodes for specific tasks'
  },
  { 
    type: 'Chat Bot', 
    icon: CloudQueue,
    description: 'Connect and integrate with external APIs'
  },
];

// Main WorkflowSidebar component that displays draggable workflow nodes
export default function WorkflowSidebar() {
  // State to manage the search input value
  const [searchQuery, setSearchQuery] = useState('');

  // Handler for when a node starts being dragged
  // Sets the drag data with the node type and allows move effect
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Filter nodes based on search query
  // Matches against both node type and description (case-insensitive)
  const filteredNodes = nodeTypes.filter(node =>
    node.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    // Main sidebar container with custom styling
    <Paper 
      elevation={3}
      sx={{
        width: 250,
        height: '100%',
        overflow: 'auto',
        borderRadius: 0,
        backgroundColor: '#2a2a2a', // Dark theme background
        borderRight: '1px solid #444',
      }}
    >
      {/* Sidebar header */}
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

      {/* Search input field with custom styling for dark theme */}
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
            '& fieldset': {
              borderColor: '#444',
            },
            '&:hover fieldset': {
              borderColor: '#ff6d5a', // Orange highlight on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ff6d5a',
            },
          },
          '& .MuiOutlinedInput-input': {
            '&::placeholder': {
              color: '#aaa',
              opacity: 1,
            },
          },
        }}
      />

      {/* List of draggable nodes */}
      <List>
        {/* Map through filtered nodes and create draggable items */}
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
              {/* Node icon */}
              <ListItemIcon sx={{ color: '#ff6d5a' }}>
                <Icon />
              </ListItemIcon>
              {/* Node title and description */}
              <ListItemText 
                primary={node.type} 
                secondary={node.description}
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    color: '#fff'
                  },
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
