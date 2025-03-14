import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import MonacoEditor from '@monaco-editor/react';
import BaseNode from './BaseNode';

export default function ClickTriggerNode({ data, id }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scheduleOutput, setScheduleOutput] = useState(`[
  {
    "location": "bengaluru",
    "businessType": "software+company"
  }
]`);
  const [tempOutput, setTempOutput] = useState(scheduleOutput);

  const handleScheduleOutputChange = (value) => {
    setTempOutput(value);
  };

  const handleSave = () => {
    try {
      // Validate JSON before saving
      JSON.parse(tempOutput);
      setScheduleOutput(tempOutput);
      sessionStorage.setItem('scheduleOutput', scheduleOutput);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Invalid JSON format:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleCancel = () => {
    setTempOutput(scheduleOutput); // Reset temp value
    setIsDialogOpen(false);
  };

  const executeNode = async () => {
    try {
      const config = JSON.parse(scheduleOutput);
      if (Array.isArray(config) && config.length > 0) {
        return config;
      }
      throw new Error('Invalid configuration format');
    } catch (error) {
      console.error('Error executing Click Trigger node:', error);
      throw new Error('Failed to parse Click Trigger configuration');
    }
  };

  // Attach the execute function to the node's data
  if (data && !data.onExecute) {
    data.onExecute = executeNode;
  }
  // This handleSave is already defined above with JSON validation

  return (
    <>
      <BaseNode 
        data={data} 
        id={id}
        showInputHandle={false}
        onDoubleClick={() => setIsDialogOpen(true)}
      >
        <Typography style={{ color: '#bbb', fontSize: '0.875rem' }}>
          Click Trigger Node
        </Typography>
      </BaseNode>

      <Dialog 
        open={isDialogOpen} 
        onClose={handleCancel}
        maxWidth={false}
        keepMounted={false}
        disablePortal={false}
        PaperProps={{
          style: { 
            backgroundColor: '#2a2a2a', 
            color: '#fff', 
            width: '40%', 
            borderRadius: '8px', 
            padding: '16px'
          },
          elevation: 24
        }}
      >
        <DialogTitle 
          sx={{ 
            borderBottom: '1px solid #444',
            padding: '16px',
            '& .MuiTypography-root': {
              fontSize: '1.5rem',
              fontWeight: 600
            }
          }}
        >
          Edit Output
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <Box sx={{ height: '400px', border: '1px solid #444', borderRadius: '4px' }}>
            <MonacoEditor
              height="400px"
              defaultLanguage="json"
              theme="vs-dark"
              value={tempOutput}
              onChange={handleScheduleOutputChange}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBars: 'vertical',
                automaticLayout: true,
                tabSize: 2
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              sx={{
                color: '#fff',
                borderColor: '#666',
                '&:hover': { borderColor: '#888' }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                backgroundColor: '#ff6d5a',
                '&:hover': { backgroundColor: '#ff8d7a' }
              }}
            >
              Save
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

ClickTriggerNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    onExecute: PropTypes.func,
  }).isRequired,
  id: PropTypes.string.isRequired,
};