import { useState } from 'react';
import { Typography, Dialog, DialogTitle, DialogContent, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import PropTypes from 'prop-types';
import BaseNode from './BaseNode';

export default function HttpRequestNode({ data, id }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    method: 'GET',
    url: '',
  });

  const handleFormChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const executeNode = async (inputData) => {
    try {
      console.log('HTTP Request executing with input:', inputData);
      
      // If we have input data and URL contains placeholders, replace them
      let url = formData.url;
      if (inputData && typeof inputData === 'object') {
        Object.entries(inputData).forEach(([key, value]) => {
          url = url.replace(`\${${key}}`, value);
        });
      }

      console.log('Making request to:', url);

      const response = await fetch(url, {
        method: formData.method,
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        ...(formData.method !== 'GET' && inputData && { body: JSON.stringify(inputData) })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Check content type to determine how to parse the response
      const contentType = response.headers.get('content-type');
      let responseData;

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        responseData = { html: text };
      } else {
        const text = await response.text();
        try {
          // Try to parse as JSON first
          responseData = JSON.parse(text);
        } catch {
          // If not JSON, return as text
          responseData = { text };
        }
      }

      console.log('HTTP Request response:', responseData);
      return responseData;
    } catch (error) {
      console.error('HTTP Request Error:', error);
      throw new Error(`Failed to execute HTTP request: ${error.message}`);
    }
  };

  // Attach the execute function to the node's data
  if (data && !data.onExecute) {
    data.onExecute = executeNode;
  }

  return (
    <>
      <BaseNode 
        data={data} 
        id={id}
        onDoubleClick={() => setIsDialogOpen(true)}
      >
        <Typography style={{ color: '#bbb', fontSize: '0.875rem' }}>
          HTTP Request Node
        </Typography>
      </BaseNode>

      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        maxWidth={false}
        PaperProps={{
          style: { backgroundColor: '#2a2a2a', color: '#fff', width: '40%', borderRadius: '8px', padding: '16px'}
        }}
      >
        <DialogTitle 
          sx={{ 
            borderBottom: '1px solid #444', 
            padding: '16px',
            '& .MuiTypography-root': { 
              fontSize: '1.5rem', 
              fontWeight: 600, 
            }
          }}
        >
          HTTP Request
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="method-label" sx={{ color: '#888', '&.Mui-focused': { color: '#ff6d5a' } }}>
              Method
            </InputLabel>
            <Select
              labelId="method-label"
              name="method"
              value={formData.method}
              onChange={handleFormChange}
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ff6d5a' }
              }}
            >
              <MenuItem value="GET">GET</MenuItem>
              <MenuItem value="POST">POST</MenuItem>
              <MenuItem value="PUT">PUT</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            margin="normal"
            label="URL"
            name="url"
            value={formData.url}
            onChange={handleFormChange}
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

          <Button
            variant="contained"
            onClick={() => setIsDialogOpen(false)}
            sx={{
              mt: 4,
              backgroundColor: '#ff6d5a',
              '&:hover': { backgroundColor: '#ff8d7a' },
              padding: '8px 24px',
              borderRadius: '4px'
            }}
          >
            Save
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

HttpRequestNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    onExecute: PropTypes.func,
  }).isRequired,
  id: PropTypes.string.isRequired,
}; 