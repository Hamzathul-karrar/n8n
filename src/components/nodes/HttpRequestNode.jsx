import { useState } from 'react';
import { Typography, Dialog, DialogTitle, DialogContent, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import PropTypes from 'prop-types';
import BaseNode from './BaseNode';

export default function HttpRequestNode({ data, id }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    method: 'POST',
    url: '',
    authentication: 'None',
  });

  const handleFormChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <>
      <BaseNode 
        data={data} 
        id={id}
        onDoubleClick={() => setIsDialogOpen(true)}
      >
        <Typography style={{ color: '#bbb', fontSize: '0.875rem' }}>
          {formData.method} {formData.url}
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

          <FormControl fullWidth margin="normal" sx={{ marginTop: '24px' }}>
            <InputLabel id="auth-label" sx={{ color: '#888', '&.Mui-focused': { color: '#ff6d5a' } }}>
              Authentication
            </InputLabel>
            <Select
              labelId="auth-label"
              name="authentication"
              value={formData.authentication}
              onChange={handleFormChange}
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ff6d5a' }
              }}
            >
              <MenuItem value="None">None</MenuItem>
              <MenuItem value="Basic">Basic Auth</MenuItem>
              <MenuItem value="Bearer">Bearer Token</MenuItem>
            </Select>
          </FormControl>

          {formData.authentication === 'Basic' && (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Username"
                name="username"
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
              <TextField
                fullWidth
                margin="normal"
                type="password"
                label="Password"
                name="password"
                sx={{
                  marginTop: '12px',
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
            </>
          )}

          {formData.authentication === 'Bearer' && (
            <TextField
              fullWidth
              margin="normal"
              label="Token"
              name="token"
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
          )}

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
  }).isRequired,
  id: PropTypes.string.isRequired,
}; 