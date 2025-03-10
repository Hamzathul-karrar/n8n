import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import BaseNode from './BaseNode';
import { useReactFlow } from 'reactflow';
import axios from 'axios';
import { useEffect } from 'react';

export default function EmailNode({ data, id }) {
  const { getEdges, getNodes } = useReactFlow();

  const isConnectedToRequiredNode = () => {
    const edges = getEdges();
    const nodes = getNodes();
    
    // Check if this node is connected to AI Scraper or Excel
    const connection = edges.find(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      return edge.target === id && 
             (sourceNode?.data?.type === 'Microsoft Excel' || 
              sourceNode?.data?.type === 'AI Scraper');
    });

    if(connection){
      const sourceNode = nodes.find(n => n.id === connection.source);
      return sourceNode?.data;
    }
    return null;
  };

  // Register execute function immediately
  useEffect(() => {
    if (data && !data.onExecute) {
      console.log("Registering email execute function");
      data.onExecute = handleEmailSend;
    }
  }, [data]);

  const isConnected = isConnectedToRequiredNode();

  return (
    <BaseNode 
      data={data} 
      id={id}
    >
      <Typography style={{ color: isConnected ? '#bbb' : '#ff4444', fontSize: '0.875rem' }}>
        {isConnected ? 'Email Node' : 'Connect to Excel/AI Scraper'}
      </Typography>
    </BaseNode>
  );
}

EmailNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    onExecute: PropTypes.func,
  }).isRequired,
  id: PropTypes.string.isRequired,
}; 