// import { useState } from 'react';
import { Handle } from 'reactflow';
import { Card, CardContent, Typography, IconButton} from '@mui/material';
import { Delete } from '@mui/icons-material';
import PropTypes from 'prop-types';

export default function CustomNode({ data, id }) {
  

  const handleDelete = () => {
    if (data.onDelete) data.onDelete(id);
  };

  

  return (
    <Card 
      variant="outlined" 
      style={{ 
        minWidth: 250,
        background: '#2a2a2a',
        border: '1px solid #444',
        borderRadius: '8px',
        color: '#fff',
        padding: 8
      }}
    >
      <Handle 
        type="target" 
        position="left" 
        style={{ background: '#ff6d5a', border: '2px solid #2a2a2a' }} 
      />
      
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" style={{ color: '#fff' }}>
            {data.label}
          </Typography>
          <IconButton 
            size="small" 
            sx={{ color: '#ff6d5a', '&:hover': { color: '#ff8d7a' } }}
            onClick={handleDelete}
          >
            <Delete fontSize="small" />
          </IconButton>
        </div>
        
        
      </CardContent>

      <Handle 
        type="source" 
        position="right" 
        style={{ background: '#ff6d5a', border: '2px solid #2a2a2a' }} 
      />

      
    </Card>
  );
}

CustomNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    onExecute: PropTypes.func, // Execute function for AI scraper
  }).isRequired,
  id: PropTypes.string.isRequired,
  edges: PropTypes.array.isRequired, // New: List of connections
};
