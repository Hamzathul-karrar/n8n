import { useState } from 'react';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import BaseNode from './BaseNode';

export default function ExcelNode({ data, id }) {
  const [isConnected, setIsConnected] = useState(false);

  const executeNode = async (inputData) => {
    try {
      console.log('Excel Node executing with input:', inputData);
      
      const response = await fetch("http://localhost:8080/api/exportExcel", {
        method: "GET",
        headers: { "Content-Type": "application/octet-stream" },
      });

      if (!response.ok) {
        throw new Error(`Failed to store data in Excel: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "scraped_data.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      console.log("📂 Data successfully Downloaded");
      setIsConnected(true);

      // Pass the data through to the next node
      return {
        success: true,
        message: 'Excel export successful',
        timestamp: new Date().toISOString(),
        data: inputData // Pass through the input data for the next node
      };
    } catch (error) {
      console.error("Excel Storage Error:", error.message);
      setIsConnected(false);
      throw new Error(`Excel export failed: ${error.message}`);
    }
  };

  // Attach the execute function to the node's data
  if (data && !data.onExecute) {
    data.onExecute = executeNode;
  }

  return (
    <BaseNode 
      data={data} 
      id={id}
    >
      <Typography style={{ color: '#bbb', fontSize: '0.875rem' }}>
        {isConnected ? 'Connected to Excel' : 'Ready to receive data'}
      </Typography>
    </BaseNode>
  );
}

ExcelNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    onExecute: PropTypes.func,
  }).isRequired,
  id: PropTypes.string.isRequired,
};