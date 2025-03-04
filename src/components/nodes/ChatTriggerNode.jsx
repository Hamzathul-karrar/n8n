import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import BaseNode from './BaseNode';

export default function ChatTriggerNode({ data, id }) {
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle incoming questions from AiScraper
  const handleQuestion = async (question) => {
    setIsProcessing(true);
    try {
      // Add the question to messages
      setMessages(prev => [...prev, { type: 'question', text: question }]);
      
      // Wait for user input
      const answer = prompt(question); // Replace with a custom UI if needed
      
      // Add the answer to messages
      setMessages(prev => [...prev, { type: 'answer', text: answer }]);
      
      return answer;
    } finally {
      setIsProcessing(false);
    }
  };

  // Register the question handler with the workflow
  useEffect(() => {
    if (data.registerCallback) {
      console.log('Registering ChatTrigger callback');
      const callback = async (question) => {
        setIsProcessing(true);
        try {
          setMessages(prev => [...prev, { type: 'question', text: question }]);
          const answer = prompt(question);
          if (answer) {
            setMessages(prev => [...prev, { type: 'answer', text: answer }]);
          }
          return answer;
        } finally {
          setIsProcessing(false);
        }
      };

      // Register the callback
      data.registerCallback('ChatTrigger', callback);

      // Cleanup function
      return () => {
        console.log('Cleaning up ChatTrigger callback');
        data.registerCallback('ChatTrigger', null);
      };
    }
  }, [data.registerCallback]); // Only re-run if registerCallback changes

  return (
    <BaseNode 
      data={data} 
      id={id}
    >
      <Typography style={{ color: '#bbb', fontSize: '0.875rem' }}>
        {isProcessing ? 'Processing...' : 
         messages.length > 0 ? 'Chat active' : 
         'Ready for chat'}
      </Typography>
    </BaseNode>
  );
}

ChatTriggerNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    registerCallback: PropTypes.func,
  }).isRequired,
  id: PropTypes.string.isRequired,
};