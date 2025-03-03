import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import BaseNode from './BaseNode';

export default function ChatTriggerNode({ data, id, isConnectedToAiScraper }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    businessType: '',
    location: ''
  });

  const handleSubmit = async () => {
    if (!formData.businessType || !formData.location) {
      return;
    }

    if (isConnectedToAiScraper && data.onExecuteAiScraper) {
      await data.onExecuteAiScraper(formData.businessType, formData.location);
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <BaseNode 
        data={data} 
        id={id}
        onDoubleClick={() => setIsDialogOpen(true)}
      >
        <Typography style={{ color: '#bbb', fontSize: '0.875rem' }}>
          Chat Trigger Node
        </Typography>
      </BaseNode>

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
          Configure Trigger
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <TextField
            fullWidth
            margin="normal"
            label="Business Type"
            value={formData.businessType}
            onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': { borderColor: '#444' },
                '&:hover fieldset': { borderColor: '#666' },
                '&.Mui-focused fieldset': { borderColor: '#ff6d5a' }
              },
              '& .MuiInputLabel-root': {
                color: '#888',
                '&.Mui-focused': { color: '#ff6d5a' }
              }
            }}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            sx={{
              marginTop: '24px',
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': { borderColor: '#444' },
                '&:hover fieldset': { borderColor: '#666' },
                '&.Mui-focused fieldset': { borderColor: '#ff6d5a' }
              },
              '& .MuiInputLabel-root': {
                color: '#888',
                '&.Mui-focused': { color: '#ff6d5a' }
              }
            }}
          />

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
              onClick={handleSubmit}
              sx={{
                backgroundColor: '#ff6d5a',
                '&:hover': { backgroundColor: '#ff8d7a' }
              }}
            >
              Trigger
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

ChatTriggerNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    onExecuteAiScraper: PropTypes.func,
  }).isRequired,
  id: PropTypes.string.isRequired,
  isConnectedToAiScraper: PropTypes.bool,
};

ChatTriggerNode.defaultProps = {
  isConnectedToAiScraper: false,
}; 