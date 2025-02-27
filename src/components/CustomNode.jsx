import { useState, useEffect } from 'react';
import { Handle } from 'reactflow';
import { 
  Card, 
  CardContent, 
  Typography, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  DialogActions,
} from '@mui/material';
import { Delete, ArrowBack, InfoOutlined, Close, Edit } from '@mui/icons-material';
import PropTypes from 'prop-types';
import MonacoEditor from '@monaco-editor/react';
import axios from 'axios';

export default function CustomNode({ data, id }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    method: 'POST',
    url: '',
    authentication: 'None',
    credential: '',
    model: '',
    apiKey: ''
  });
  
  // Default schedule output
  const [scheduleOutput, setScheduleOutput] = useState(`[
  {
    "name": "First item",
    "code": 1
  },
  {
    "name": "Second item",
    "code": 2
  }
]`);

  // Add default Code code
  const [jsCode, setJsCode] = useState(`const data = $input.first().json.data;

const regex = /https:\\/\\/[\\s"]+/g;

let urls = data.match(regex) || [];

return urls.map(url => {
  const domainMatch = url.match(/https:\\/\\/[\\/]+/);
  const domain = domainMatch ? domainMatch[0] : url;
  return { json: { url: domain } };
});`);

  // Add new state for credential dialog
  const [isCredentialDialogOpen, setIsCredentialDialogOpen] = useState(false);

  // Add these new states
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Add a new state for chat dialog
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);

  // Add this state to track if credentials are saved
  const [isCredentialSaved, setIsCredentialSaved] = useState(false);

  useEffect(() => {
    // Load saved credentials from localStorage
    const savedCredentials = JSON.parse(localStorage.getItem('apiCredentials') || '{}');
    if (savedCredentials) {
      setFormData(prev => ({
        ...prev,
        apiKey: savedCredentials.apiKey || '',
        model: savedCredentials.model || ''
      }));
    }
  }, []);

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
  }, []); // Remove savedCredentials from dependency array since it's not defined

  const handleDelete = () => {
    if (data.onDelete) data.onDelete(id);
  };

  const handleDoubleClick = () => {
    if (data.type === "HTTP Request") {
      setIsDialogOpen(true);
    } else if (data.type === "Click Trigger") {
      setIsDialogOpen(true);
    } else if (data.type === "Code") {
      setIsDialogOpen(true);
    } else if (data.type === "Chat Bot") {
      setIsDialogOpen(true);
    }
  };

  const handleClose = () => {
    setIsDialogOpen(false);
  };

  const handleFormChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleScheduleOutputChange = (value) => {
    setScheduleOutput(value);
  };

  const handleCodeChange = (value) => {
    setJsCode(value);
  };

  // Add handler to close credential dialog
  const handleCredentialDialogClose = () => {
    setIsCredentialDialogOpen(false);
  };

  // Add this function to handle chat messages
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
      <Card 
        variant="outlined" 
        style={{ 
          minWidth: 250,
          background: '#2a2a2a',
          border: '1px solid #444',
          borderRadius: '8px',
          color: '#fff',
          padding: 8,
          cursor: 'pointer'
        }}
        onDoubleClick={handleDoubleClick}
      >
        <Handle 
          type="target" 
          position="left" 
          style={{ background: '#ff6d5a', border: '2px solid #2a2a2a' }} 
        />
        
        <CardContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" style={{ color: '#fff' }}>
              {data.label}
            </Typography>
            <IconButton 
              size="small" 
              sx={{ color: '#ff6d5a', '&:hover': { color: '#ff8d7a' } }}
              onClick={handleDelete}
            >
              <Delete fontSize="small" />
            </IconButton>
          </div>
          
          {data.type === "HTTP Request" && (
            <Typography style={{ color: '#bbb', fontSize: '0.875rem' }}>
              {formData.method} {formData.url}
            </Typography>
          )}
        </CardContent>

        <Handle 
          type="source" 
          position="right" 
          style={{ background: '#ff6d5a', border: '2px solid #2a2a2a' }} 
        />
      </Card>

      {data.type === "HTTP Request" && (
        <Dialog 
          open={isDialogOpen} 
          onClose={handleClose}
          maxWidth={false}
          PaperProps={{
            style: {
              backgroundColor: '#2a2a2a',
              color: '#fff',
              width: '40%',
              borderRadius: '8px',
              padding: '16px'
            }
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
              <InputLabel 
                id="method-label" 
                sx={{ 
                  color: '#888',
                  '&.Mui-focused': {
                    color: '#ff6d5a',
                    
                  }
                }}
              >
                Method
              </InputLabel>
              <Select
                labelId="method-label"
                name="method"
                value={formData.method}
                onChange={handleFormChange}
                sx={{
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#444'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#666'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ff6d5a'
                  }
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
                  '& fieldset': {
                    borderColor: '#444'
                  },
                  '&:hover fieldset': {
                    borderColor: '#666'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ff6d5a'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#888',
                  '&.Mui-focused': {
                    color: '#ff6d5a'
                  }
                }
              }}
            />

            <FormControl fullWidth margin="normal" sx={{ marginTop: '24px' }}>
              <InputLabel 
                id="auth-label"
                sx={{ 
                  color: '#888',
                  '&.Mui-focused': {
                    color: '#ff6d5a'
                  }
                }}
              >
                Authentication
              </InputLabel>
              <Select
                labelId="auth-label"
                name="authentication"
                value={formData.authentication}
                onChange={handleFormChange}
                sx={{
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#444'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#666'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ff6d5a'
                  }
                }}
              >
                <MenuItem value="None">None</MenuItem>
                <MenuItem value="Basic">Basic Auth</MenuItem>
                <MenuItem value="Bearer">Bearer Token</MenuItem>
              </Select>
            </FormControl>

            <Button 
              variant="contained" 
              onClick={handleClose}
              sx={{ 
                mt: 4,
                backgroundColor: '#ff6d5a',
                '&:hover': {
                  backgroundColor: '#ff8d7a'
                },
                padding: '8px 24px',
                borderRadius: '4px'
              }}
            >
              Save
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {data.type === "Click Trigger" && (
        <Dialog 
          open={isDialogOpen} 
          onClose={handleClose}
          maxWidth={false}
          PaperProps={{
            style: {
              backgroundColor: '#2a2a2a',
              color: '#fff',
              width: '40%',
              borderRadius: '8px',
              padding: '16px'
            }
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
                onClick={handleClose}
                sx={{ 
                  color: '#fff',
                  borderColor: '#666',
                  '&:hover': {
                    borderColor: '#888'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleClose}
                sx={{ 
                  backgroundColor: '#ff6d5a',
                  '&:hover': {
                    backgroundColor: '#ff8d7a'
                  }
                }}
              >
                Save
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}

      {data.type === "Code" && (
        <Dialog 
          open={isDialogOpen} 
          onClose={handleClose}
          maxWidth={false}
          PaperProps={{
            style: {
              backgroundColor: '#2a2a2a',
              color: '#fff',
              width: '40%',
              borderRadius: '8px',
              padding: '16px'
            }
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
            Code
          </DialogTitle>
          <DialogContent sx={{ padding: '24px' }}>
            <FormControl fullWidth margin="normal" sx={{ mt: 3 }}>
              <InputLabel 
                id="language-label"
                sx={{ 
                  color: '#888',
                  '&.Mui-focused': {
                    color: '#ff6d5a'
                  }
                }}
              >
                Language
              </InputLabel>
              <Select
                labelId="language-label"
                value="Code"
                sx={{
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#444'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#666'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ff6d5a'
                  }
                }}
              >
                <MenuItem value="Code">JavaScript</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ height: '400px', border: '1px solid #444', borderRadius: '4px', mt: 3 }}>
              <MonacoEditor
                height="400px"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={jsCode}
                onChange={handleCodeChange}
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
                onClick={handleClose}
                sx={{ 
                  color: '#fff',
                  borderColor: '#666',
                  '&:hover': {
                    borderColor: '#888'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleClose}
                sx={{ 
                  backgroundColor: '#ff6d5a',
                  '&:hover': {
                    backgroundColor: '#ff8d7a'
                  }
                }}
              >
                Save
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}

      {data.type === "Chat Bot" && (
        <Dialog 
          open={isDialogOpen} 
          onClose={handleClose}
          maxWidth={false}
          PaperProps={{
            style: {
              backgroundColor: '#2a2a2a',
              color: '#fff',
              width: '40%',
              borderRadius: '8px',
              padding: '16px'
            }
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
                  '&.Mui-focused': {
                    color: '#ff6d5a'
                  }
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
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#444'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: isCredentialSaved ? '#444' : '#666'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ff6d5a'
                    },
                    '&.Mui-disabled': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#444'
                      },
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
                      '&:hover': {
                        backgroundColor: 'rgba(255, 109, 90, 0.08)'
                      }
                    }}
                  >
                    <Edit />
                  </IconButton>
                )}
              </Box>
            </FormControl>

            {/* Model Input */}
            <TextField
              fullWidth
              margin="normal"
              label="Model"
              value={formData.model}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  model: e.target.value
                });
              }}
              placeholder="Enter the model name (e.g., google/gemini-1.5-flash)"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': {
                    borderColor: '#444'
                  },
                  '&:hover fieldset': {
                    borderColor: '#666'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ff6d5a'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#888',
                  '&.Mui-focused': {
                    color: '#ff6d5a'
                  }
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
                onClick={handleClose}
                sx={{ 
                  color: '#fff',
                  borderColor: '#666',
                  '&:hover': {
                    borderColor: '#888'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  const savedCredentials = JSON.parse(localStorage.getItem('apiCredentials') || '{}');
                  const updatedCredentials = {
                    ...savedCredentials,
                    model: formData.model
                  };
                  localStorage.setItem('apiCredentials', JSON.stringify(updatedCredentials));
                  handleClose();
                  setIsChatDialogOpen(true);
                }}
                sx={{ 
                  backgroundColor: '#ff6d5a',
                  '&:hover': {
                    backgroundColor: '#ff8d7a'
                  }
                }}
              >
                Save
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}

      {isCredentialDialogOpen && (
        <Dialog 
          open={isCredentialDialogOpen} 
          onClose={handleCredentialDialogClose}
          maxWidth={false}
          PaperProps={{
            style: {
              backgroundColor: '#2a2a2a',
              color: '#fff',
              width: '40%',
              borderRadius: '8px',
              padding: '16px'
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              borderBottom: '1px solid #444',
              padding: '16px',
              '& .MuiTypography-root': {
                fontSize: '1.5rem',
                fontWeight: 600
              }
            }}
          >
            <IconButton 
              onClick={handleCredentialDialogClose}
              sx={{ color: '#fff' }}
            >
              <ArrowBack />
            </IconButton>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: '#ffffff',
                marginLeft: '8px',
                fontSize: '1rem'
              }}
            >
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
                    '&:hover': {
                      backgroundColor: '#444'
                    }
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
                        '& fieldset': {
                          borderColor: '#444'
                        },
                        '&:hover fieldset': {
                          borderColor: '#666'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#ff6d5a'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: '#888',
                        '&.Mui-focused': {
                          color: '#ff6d5a'
                        }
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
                // Save credentials to localStorage
                const credentials = {
                  apiKey: formData.apiKey,
                  model: formData.model
                };
                localStorage.setItem('apiCredentials', JSON.stringify(credentials));
                setIsCredentialSaved(true);
                handleCredentialDialogClose();
              }}
              sx={{
                backgroundColor: '#ff6d5a',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#ff8d7a'
                }
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
            style: {
              backgroundColor: '#2a2a2a',
              color: '#fff',
              width: '50%',
              borderRadius: '8px',
              padding: '16px'
            }
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
            <Box 
              sx={{ 
                height: '400px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Messages Area */}
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

              {/* Input Area */}
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

CustomNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    onExecute: PropTypes.func,
  }).isRequired,
  id: PropTypes.string.isRequired,
};
