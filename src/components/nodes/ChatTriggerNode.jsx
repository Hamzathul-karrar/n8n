// import { useState } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   Box,
//   Button,
//   TextField,
//   Typography,
// } from '@mui/material';
// import PropTypes from 'prop-types';
// import BaseNode from './BaseNode';

// export default function ChatTriggerNode({ data, id, isConnectedToAiScraper }) {
//   const [messages, setMessages] = useState([]);
//   const [currentInput, setCurrentInput] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);

//   // Handle incoming questions from AiScraper
//   const handleQuestion = async (question) => {
//     // Add the question to messages
//     setMessages(prev => [...prev, { type: 'question', text: question }]);
    
//     // Wait for user input
//     const answer = prompt(question); // For now using prompt, you can replace with a better UI
    
//     // Add the answer to messages
//     setMessages(prev => [...prev, { type: 'answer', text: answer }]);
    
//     return answer;
//   };

//   // Register the question handler with the workflow
//   if (data.registerCallback) {
//     data.registerCallback('ChatTrigger', handleQuestion);
//   }

//   return (
//     <BaseNode 
//       data={data} 
//       id={id}
//     >
//       <Typography style={{ color: '#bbb', fontSize: '0.875rem' }}>
//         {isProcessing ? 'Processing...' : 
//          messages.length > 0 ? 'Chat active' : 
//          isConnectedToAiScraper ? 'Ready for chat' : 'Configure trigger'}
//       </Typography>
//     </BaseNode>
//   );
// }

// ChatTriggerNode.propTypes = {
//   data: PropTypes.shape({
//     label: PropTypes.string.isRequired,
//     type: PropTypes.string.isRequired,
//     onDelete: PropTypes.func.isRequired,
//     registerCallback: PropTypes.func,
//   }).isRequired,
//   id: PropTypes.string.isRequired,
//   isConnectedToAiScraper: PropTypes.bool,
// };

// ChatTriggerNode.defaultProps = {
//   isConnectedToAiScraper: false,
// }; 
import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import BaseNode from './BaseNode';

export default function ChatTriggerNode({ data, id }) {
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle incoming questions from AiScraper
  const handleQuestion = async (question) => {
    // Add the question to messages
    setMessages(prev => [...prev, { type: 'question', text: question }]);
    
    // Wait for user input
    const answer = prompt(question); // Replace with a custom UI if needed
    
    // Add the answer to messages
    setMessages(prev => [...prev, { type: 'answer', text: answer }]);
    
    return answer;
  };

  // Register the question handler with the workflow
  useEffect(() => {
    if (data.registerCallback) {
      data.registerCallback('ChatTrigger', handleQuestion);
    }
  }, [data.registerCallback]); // Only run once when the node is mounted

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