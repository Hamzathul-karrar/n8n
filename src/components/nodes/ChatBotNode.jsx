import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  IconButton
} from '@mui/material';
import { ArrowBack, InfoOutlined, Close, Edit } from '@mui/icons-material';
import PropTypes from 'prop-types';
import axios from 'axios';
import BaseNode from './BaseNode';

export default function ChatBotNode({ data, id }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCredentialDialogOpen, setIsCredentialDialogOpen] = useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [isCredentialSaved, setIsCredentialSaved] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [formData, setFormData] = useState({
    credential: '',
    model: '',
    apiKey: ''
  });

  useEffect(() => {
    const savedCredentials = JSON.parse(localStorage.getItem('apiCredentials') || '{}');
    if (savedCredentials.apiKey) {
      setIsCredentialSaved(true);
      setFormData(prev => ({
        ...prev,
        credential: 'Connected',
        apiKey: savedCredentials.apiKey,
        model: savedCredentials.model || ''
      }));
    }
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || !formData.apiKey || !formData.model) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: formData.model,
          messages: newMessages,
        },
        {
          headers: {
            Authorization: `Bearer ${formData.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      const aiResponse = response.data.choices[0].message;
      setMessages([...newMessages, aiResponse]);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to fetch response. Check API key and internet connection.");
    }
  };

  return (
    <>
      <BaseNode 
        data={data} 
        id={id}
        onDoubleClick={() => setIsDialogOpen(true)}>
          <Typography style={{ color: '#bbb', fontSize: '0.875rem' }}>
          Chat Bot Node
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
          Chat Model
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <FormControl fullWidth margin="normal">
            <InputLabel
              id="credential-label"
              sx={{
                color: '#888',
                '&.Mui-focused': { color: '#ff6d5a' }
              }}
            >
              Add Credential to connect
            </InputLabel>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Select
                labelId="credential-label"
                value={isCredentialSaved ? "Connected" : formData.credential}
                disabled={isCredentialSaved}
                onChange={(e) => {
                  if (e.target.value === "+ Create new Credential") {
                    setIsCredentialDialogOpen(true);
                  } else {
                    setFormData({
                      ...formData,
                      credential: e.target.value
                    });
                  }
                }}
                sx={{
                  flex: 1,
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: isCredentialSaved ? '#444' : '#666' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ff6d5a' },
                  '&.Mui-disabled': {
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                    '& .MuiSelect-select': {
                      color: '#ff6d5a',
                      '-webkit-text-fill-color': '#ff6d5a'
                    }
                  }
                }}
              >
                <MenuItem value="Connected" disabled={!isCredentialSaved}>Connected</MenuItem>
                {!isCredentialSaved && (
                  <>
                    <MenuItem value="Select Credential">Select Credential</MenuItem>
                    <MenuItem value="+ Create new Credential">+ Create new Credential</MenuItem>
                  </>
                )}
              </Select>
              {isCredentialSaved && (
                <IconButton
                  onClick={() => {
                    setIsCredentialSaved(false);
                    setIsCredentialDialogOpen(true);
                  }}
                  sx={{
                    color: '#ff6d5a',
                    '&:hover': { backgroundColor: 'rgba(255, 109, 90, 0.08)' }
                  }}
                >
                  <Edit />
                </IconButton>
              )}
            </Box>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Model"
            value={formData.model}
            onChange={(e) => { setFormData({ ...formData, model: e.target.value }); }}
            placeholder="Enter the model name (e.g., google/gemini-1.5-flash)"
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
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#666',
                opacity: 1
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
              onClick={() => {
                const savedCredentials = JSON.parse(localStorage.getItem('apiCredentials') || '{}');
                const updatedCredentials = { ...savedCredentials, model: formData.model };
                localStorage.setItem('apiCredentials', JSON.stringify(updatedCredentials));
                setIsDialogOpen(false);
                setIsChatDialogOpen(true);
              }}
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

      {isCredentialDialogOpen && (
        <Dialog
          open={isCredentialDialogOpen}
          onClose={() => setIsCredentialDialogOpen(false)}
          maxWidth={false}
          PaperProps={{
            style: { backgroundColor: '#2a2a2a', color: '#fff', width: '40%', borderRadius: '8px', padding: '16px' }
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              borderBottom: '1px solid #444',
              padding: '16px'
            }}
          >
            <IconButton onClick={() => setIsCredentialDialogOpen(false)} sx={{ color: '#fff' }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="subtitle1" sx={{ color: '#ffffff', marginLeft: '8px', fontSize: '1rem' }}>
              Chat Model
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ padding: '24px' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Button
                  sx={{
                    color: '#fff',
                    backgroundColor: '#3a3a3a',
                    padding: '12px 24px',
                    width: '100%',
                    justifyContent: 'flex-start',
                    '&:hover': { backgroundColor: '#444' }
                  }}
                >
                  Connection
                </Button>
              </Box>
              <Box sx={{ flex: 5 }}>
                <FormControl fullWidth margin="normal">
                  <TextField
                    required
                    fullWidth
                    type="password"
                    label="API Key"
                    value={formData.apiKey}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        apiKey: e.target.value
                      }));
                    }}
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
                </FormControl>
                <Typography
                  sx={{
                    color: '#888',
                    fontSize: '0.875rem',
                    marginTop: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <InfoOutlined sx={{ fontSize: '1rem' }} />
                  Enterprise plan users can pull in credentials from external vaults.
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ padding: '16px', borderTop: '1px solid #444' }}>
            <Button
              variant="contained"
              onClick={() => {
                const credentials = { apiKey: formData.apiKey, model: formData.model };
                localStorage.setItem('apiCredentials', JSON.stringify(credentials));
                setIsCredentialSaved(true);
                setIsCredentialDialogOpen(false);
              }}
              sx={{
                backgroundColor: '#ff6d5a',
                color: '#fff',
                '&:hover': { backgroundColor: '#ff8d7a' }
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {isChatDialogOpen && (
        <Dialog
          open={isChatDialogOpen}
          onClose={() => setIsChatDialogOpen(false)}
          maxWidth={false}
          PaperProps={{
            style: { backgroundColor: '#2a2a2a', color: '#fff', width: '50%', borderRadius: '8px', padding: '16px' }
          }}
        >
          <DialogTitle
            sx={{
              borderBottom: '1px solid #444',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="h6">Chat Interface</Typography>
            <IconButton
              onClick={() => setIsChatDialogOpen(false)}
              sx={{ color: '#fff' }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ padding: '24px' }}>
            <Box sx={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  backgroundColor: '#1a1a1a',
                  borderRadius: '8px',
                  marginBottom: 2
                }}
              >
                {messages.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      alignSelf: msg.role === "user" ? 'flex-end' : 'flex-start',
                      backgroundColor: msg.role === "user" ? '#ff6d5a' : '#3a3a3a',
                      color: '#fff',
                      p: 2,
                      borderRadius: '8px',
                      maxWidth: '80%'
                    }}
                  >
                    <Typography>{msg.content}</Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      backgroundColor: '#1a1a1a',
                      '& fieldset': { borderColor: '#444' },
                      '&:hover fieldset': { borderColor: '#666' },
                      '&.Mui-focused fieldset': { borderColor: '#ff6d5a' }
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  variant="contained"
                  sx={{
                    backgroundColor: '#ff6d5a',
                    '&:hover': { backgroundColor: '#ff8d7a' }
                  }}
                >
                  Send
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

ChatBotNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
  }).isRequired,
  id: PropTypes.string.isRequired,
}; 