import { useState } from 'react';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import BaseNode from './BaseNode';

export default function ExcelNode({ data, id }) {
  const [isConnected, setIsConnected] = useState(false);

  const exportDataToExcel = async () => {
    try {
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
    } catch (error) {
      console.error("Excel Storage Error:", error.message);
      setIsConnected(false);
    }
  };

  return (
    <BaseNode 
      data={data} 
      id={id}
      showOutputHandle={false}
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
  }).isRequired,
  id: PropTypes.string.isRequired,
}; 