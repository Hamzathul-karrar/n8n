import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Stack,
  Modal,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { geminiService } from '../services/gemini.service';

export default function ChatBox({ open, onClose }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        text: "Hi! I'm your AI assistant. How can I help you today?",
        sender: 'bot'
      }]);
    }
  }, [open]);

  const handleSend = async () => {
    if (message.trim()) {
      const userMessage = message.trim();
      setMessage('');
      
      setMessages(prev => [...prev, { 
        text: userMessage, 
        sender: 'user' 
      }]);

      setIsTyping(true);
      try {
        const response = await geminiService.generateResponse(userMessage, messages);
        setMessages(prev => [...prev, { 
          text: response, 
          sender: 'bot' 
        }]);
      } catch (error) {
        console.error('Chat Error:', error);
        setMessages(prev => [...prev, { 
          text: 'Sorry, I encountered an error. Please try again.', 
          sender: 'bot' 
        }]);
      }
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="chat-modal-title"
      disableEnforceFocus
      disableAutoFocus
      keepMounted
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: 320,
          height: 450,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#2a2a2a',
          color: '#fff',
          borderRadius: 2,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #404040',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" id="chat-modal-title">Chat Assistant</Typography>
          <IconButton 
            onClick={onClose}
            size="small" 
            sx={{ color: '#ff6d5a' }}
            aria-label="close chat"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
          role="log"
          aria-live="polite"
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  bgcolor: msg.sender === 'user' ? '#ff6d5a' : '#404040',
                  borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                }}
                role={msg.sender === 'user' ? 'note' : 'status'}
              >
                <Typography sx={{ color: '#fff', whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </Typography>
              </Paper>
            </Box>
          ))}
          {isTyping && (
            <Box sx={{ alignSelf: 'flex-start', pl: 1 }} role="status" aria-label="Assistant is typing">
              <CircularProgress size={20} sx={{ color: '#ff6d5a' }} />
            </Box>
          )}
        </Box>

        <Stack
          direction="row"
          sx={{
            p: 2,
            borderTop: '1px solid #404040',
            bgcolor: '#2a2a2a',
          }}
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
            multiline
            maxRows={4}
            aria-label="Chat message"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                backgroundColor: '#1a1a1a',
                '& fieldset': {
                  borderColor: '#404040',
                },
                '&:hover fieldset': {
                  borderColor: '#ff6d5a',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff6d5a',
                },
              },
            }}
          />
          <IconButton
            type="submit"
            disabled={!message.trim() || isTyping}
            aria-label="Send message"
            sx={{
              ml: 1,
              color: '#ff6d5a',
              '&.Mui-disabled': {
                color: '#404040',
              },
            }}
          >
            {isTyping ? (
              <CircularProgress size={24} sx={{ color: '#ff6d5a' }} />
            ) : (
              <SendIcon />
            )}
          </IconButton>
        </Stack>
      </Paper>
    </Modal>
  );
}

ChatBox.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}; 