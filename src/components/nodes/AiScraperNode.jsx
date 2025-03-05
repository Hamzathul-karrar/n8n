import { useState } from 'react';
import { Typography, Dialog, DialogTitle, DialogContent, Button, TextField, Box } from '@mui/material';
import PropTypes from 'prop-types';
import BaseNode from './BaseNode';
import { AiScraperService } from '../../services/AiScraperService';

export default function AiScraperNode({ data, id }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    businessType: '',
    location: ''
  });

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExecute = async (inputData) => {
    setIsProcessing(true);
    try {
      // Get chat callback if available
      const askQuestion = data.getChatCallback?.('ChatTrigger');
      
      // Check Excel connection
      const isConnectedToExcel = data.isExcelConnected?.();
      console.log("Excel connection status:", isConnectedToExcel);
      
      // Execute scraping through service with Excel connection status
      const scrapedData = await AiScraperService.handleNodeExecution(
        inputData, 
        askQuestion,
        isConnectedToExcel
      );

      setIsDialogOpen(false);
      return scrapedData;

    } catch (error) {
      console.error('Scraper Error:', error);
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    } finally {
      setIsProcessing(false);
    }
  };

  // Register the execute function with the workflow
  if (data.registerExecute) {
    data.registerExecute('AiScraper', handleExecute);
  }

  return (
    <>
      <BaseNode 
        data={data} 
        id={id}
        onDoubleClick={() => setIsDialogOpen(true)}
      >
        <Typography style={{ color: '#bbb', fontSize: '0.875rem' }}>
          {isProcessing ? 'Scraping...' : 'Ready to scrape'}
        </Typography>
      </BaseNode>

      <Dialog
        open={isDialogOpen}
        onClose={() => !isProcessing && setIsDialogOpen(false)}
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
          AI Scraper Configuration
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <TextField
            fullWidth
            margin="normal"
            label="Business Type"
            name="businessType"
            value={formData.businessType}
            onChange={handleFormChange}
            disabled={isProcessing}
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
            name="location"
            value={formData.location}
            onChange={handleFormChange}
            disabled={isProcessing}
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
              disabled={isProcessing}
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
              onClick={() => handleExecute(formData)}
              disabled={isProcessing}
              sx={{
                backgroundColor: '#ff6d5a',
                '&:hover': { backgroundColor: '#ff8d7a' }
              }}
            >
              {isProcessing ? 'Scraping...' : 'Start Scraping'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

AiScraperNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    isExcelConnected: PropTypes.func,
    registerExecute: PropTypes.func,
    getChatCallback: PropTypes.func,
  }).isRequired,
  id: PropTypes.string.isRequired,
};