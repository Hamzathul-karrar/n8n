import { useState } from 'react';
import { Typography, Dialog, DialogTitle, DialogContent, TextField, Button, Box } from '@mui/material';
import PropTypes from 'prop-types';
import BaseNode from './BaseNode';

export default function AiScraperNode({ data, id }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    businessType: '',
    location: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFormChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleExecute = async () => {
    if (!formData.businessType || !formData.location) {
      alert("Both fields are required!");
      return;
    }

    setIsProcessing(true);
    try {
      console.log(`Scraping for: ${formData.businessType} in ${formData.location}`);
      const response = await fetch(
        `http://localhost:8080/api/scrape?businessType=${formData.businessType}&location=${formData.location}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      const responseText = await response.text();
      console.log("📥 Raw Response:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        console.warn("Response is not valid JSON. Treating as plain text.");
        data = { message: responseText };
      }

      console.log('Scraped Data:', data);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Scraper Error:', error);
      alert('Failed to scrape data. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <BaseNode 
        data={data} 
        id={id}
        onDoubleClick={() => setIsDialogOpen(true)}
      >
        <Typography style={{ color: '#bbb', fontSize: '0.875rem' }}>
          AI Scraper Node
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
              onClick={handleExecute}
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
  }).isRequired,
  id: PropTypes.string.isRequired,
}; 