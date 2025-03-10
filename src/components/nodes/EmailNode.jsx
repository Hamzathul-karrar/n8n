import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import BaseNode from './BaseNode';
import { useReactFlow } from 'reactflow';
import axios from 'axios';

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

    return !!connection;
  };

  const sendDataToBackend = async (endpoint, payload) => {
    try {
      const response = await axios.post(`http://localhost:8080/api/${endpoint}`, payload);
      console.log(`Data sent to ${endpoint}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error sending data to ${endpoint}:`, error);
      throw error;
    }
  };

  const handleEmailSend = async () => {
    try {
      console.log("Email node executing...");
      const username = sessionStorage.getItem('username');
      const password = sessionStorage.getItem('password');
      const jobType = sessionStorage.getItem('businessType');

      if (!username || !password) {
        console.error('User not logged in');
        throw new Error('User not logged in');
      }

      if (!jobType) {
        console.error('No business type found');
        throw new Error('No business type found');
      }

      const userResponse = await axios.get(
        `http://localhost:8080/api/getUser?username=${username}&password=${password}`
      );

      if (!userResponse.data) {
        throw new Error('User data not found');
      }

      const { name: senderName, companyName, companyDescription, contactInfo } = userResponse.data;
      const payload = {
        subject: "Business Email",
        jobtype: jobType,
        senderName: senderName,
        companyName: companyName,
        serviceDetails: companyDescription,
        contact: contactInfo,
      };

      await sendDataToBackend("send", payload);
      console.log('Email sent successfully:', payload);
      return { status: 'success', message: 'Email sent successfully' };

    } catch (error) {
      console.error('Error in email process:', error);
      throw error;
    }
  };

  // Register execute function if connected to required node
  if (data && !data.onExecute && isConnectedToRequiredNode()) {
    console.log("Registering email execute function");
    data.onExecute = handleEmailSend;
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