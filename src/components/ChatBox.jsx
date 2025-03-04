import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Stack,
  Slide,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { geminiService } from '../services/gemini.service';

export default function ChatBox({ open, onClose, nodes, edges, workflow }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (open && messages.length === 0) {
      const workflowName = workflow?.projectName || 'Current Workflow';
      const nodeCount = nodes?.length || 0;
      const edgeCount = edges?.length || 0;

      setMessages([{
        text: `Hi! I'm here to help you with "${workflowName}"\n\nCurrent workflow status:\n- ${nodeCount} nodes\n- ${edgeCount} connections\n\nHow can I assist you with your workflow?`,
        sender: 'bot'
      }]);
    }
  }, [open, workflow, nodes, edges]);

  const getChatbotResponse = async (userMessage) => {
    try {
      setIsTyping(true);

      // Add workflow context to every message
      const workflowContext = {
        workflowId: workflow?.id,
        workflowName: workflow?.projectName,
        nodeCount: nodes?.length || 0,
        edgeCount: edges?.length || 0,
        lastModified: workflow?.lastModified,
        nodes: nodes?.map(node => ({
          id: node.id,
          type: node.type,
          data: node.data
        })),
        edges: edges
      };

      // Check for specific workflow-related queries
      if (userMessage.toLowerCase().includes('analyze workflow') || 
          userMessage.toLowerCase().includes('check workflow')) {
        return await geminiService.analyzeWorkflow(workflowContext);
      }

      if (userMessage.toLowerCase().includes('suggest') || 
          userMessage.toLowerCase().includes('what next') ||
          userMessage.toLowerCase().includes('recommend')) {
        return await geminiService.getNodeSuggestions(workflowContext.nodes);
      }

      if (userMessage.toLowerCase().includes('error') || 
          userMessage.toLowerCase().includes('problem') ||
          userMessage.toLowerCase().includes('not working')) {
        const context = `Workflow: ${workflowContext.workflowName}\nNodes: ${workflowContext.nodeCount}\nConnections: ${workflowContext.edgeCount}`;
        return await geminiService.getTroubleshootingHelp(userMessage, context);
      }

      // Add workflow context to the message
      const messageWithContext = `[Workflow: ${workflowContext.workflowName}] ${userMessage}`;
      return await geminiService.generateResponse(messageWithContext, messages);
    } catch (error) {
      console.error('Chatbot Error:', error);
      return "I apologize, but I'm having trouble connecting to the AI service. Please try again later.";
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (message.trim()) {
      const userMessage = message.trim();
      setMessage('');
      
      setMessages(prev => [...prev, { 
        text: userMessage, 
        sender: 'user' 
      }]);

      const botResponse = await getChatbotResponse(userMessage);
      setMessages(prev => [...prev, { 
        text: botResponse, 
        sender: 'bot' 
      }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Slide direction="up" in={open} mountOnEnter unmountOnExit>
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 320,
          height: 450,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#2a2a2a',
          color: '#fff',
          zIndex: 1000,
          borderRadius: 2,
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
          <Typography variant="h6">Workflow Assistant</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: '#ff6d5a' }}>
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
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#1a1a1a',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#404040',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#ff6d5a',
            },
          }}
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
              >
                <Typography sx={{ color: '#fff' }}>
                  {msg.text}
                </Typography>
              </Paper>
            </Box>
          ))}
          {isTyping && (
            <Box sx={{ alignSelf: 'flex-start', pl: 1 }}>
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
        >
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Ask about your workflow..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
            multiline
            maxRows={4}
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
              '& .MuiOutlinedInput-input': {
                color: '#fff',
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!message.trim() || isTyping}
            sx={{
              ml: 1,
              color: '#ff6d5a',
              '&.Mui-disabled': {
                color: '#404040',
              },
            }}
          >
            {isTyping ? <CircularProgress size={24} sx={{ color: '#ff6d5a' }} /> : <SendIcon />}
          </IconButton>
        </Stack>
      </Paper>
    </Slide>
  );
}

ChatBox.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  nodes: PropTypes.array,
  edges: PropTypes.array,
  workflow: PropTypes.object,
}; 