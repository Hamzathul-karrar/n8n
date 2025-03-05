import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import BaseNode from './BaseNode';
import { useReactFlow } from 'reactflow';

export default function EmailNode({ data, id }) {
  const { getEdges, getNodes } = useReactFlow();

  const isConnectedToRequiredNode = () => {
    const edges = getEdges();
    const nodes = getNodes();
    
    return edges.some(edge => {
      const connectedNode = nodes.find(n => 
        (edge.source === id && n.id === edge.target) || 
        (edge.target === id && n.id === edge.source)
      );
      return connectedNode?.data?.type === 'Microsoft Excel' || 
             connectedNode?.data?.type === 'AI Scraper';
    });
  };

  const executeNode = async (inputData) => {
    try {
      console.log('Email Node executing with input:', inputData);
      
      // Check if connected to required nodes
      if (!isConnectedToRequiredNode()) {
        throw new Error('Email Node must be connected to either Excel Node or AI Scraper Node');
      }

      // Here you would typically make an API call to your backend to send the email
      const emailConfig = {
        to: inputData.to || '',
        subject: inputData.subject || '',
        body: inputData.body || ''
      };

      console.log('Sending email with config:', emailConfig);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        message: 'Email sent successfully',
        timestamp: new Date().toISOString(),
        config: emailConfig
      };
    } catch (error) {
      console.error('Email Node Error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  };

  // Attach the execute function to the node's data
  if (data && !data.onExecute) {
    data.onExecute = executeNode;
  }

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