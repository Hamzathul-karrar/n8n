import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Button } from '@mui/material';
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

  const handleScheduleOutputChange = (value) => {
    setScheduleOutput(value);
  };

  return (
    <>
      <BaseNode 
        data={data} 
        id={id}
        showInputHandle={false}
        onDoubleClick={() => setIsDialogOpen(true)}
      />

      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        maxWidth={false}
        PaperProps={{
          style: { backgroundColor: '#2a2a2a', color: '#fff', width: '40%', borderRadius: '8px', padding: '16px' }
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
              value={scheduleOutput}
              onChange={handleScheduleOutputChange}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBars: 'vertical',
                automaticLayout: true
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setIsDialogOpen(false)}
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
              onClick={() => setIsDialogOpen(false)}
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
  }).isRequired,
  id: PropTypes.string.isRequired,
}; 