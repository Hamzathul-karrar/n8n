//  import { useState } from 'react';
// import { Typography } from '@mui/material';
// import PropTypes from 'prop-types';
// import BaseNode from './BaseNode';

// export default function AiScraperNode({ data, id }) {
//   const [isProcessing, setIsProcessing] = useState(false);

//   const handleExecute = async () => {
//     setIsProcessing(true);
//     try {
//       // Get the chat trigger's question handler
//       const askQuestion = data.getChatCallback?.('ChatTrigger');
//       if (!askQuestion) {
//         throw new Error('Chat Trigger not connected');
//       }

//       // Ask for business type
//       const businessType = await askQuestion('What type of business are you looking for?');
//       if (!businessType) throw new Error('Business type is required');

//       // Ask for location
//       const location = await askQuestion('Where would you like to search?');
//       if (!location) throw new Error('Location is required');

//       console.log(`Scraping for: ${businessType} in ${location}`);
//       const response = await fetch(
//         `http://localhost:8080/api/scrape?businessType=${businessType}&location=${location}`,
//         {
//           method: 'GET',
//           headers: { 'Content-Type': 'application/json' },
//           mode: 'cors',
//         }
//       );

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
//       }

//       const responseText = await response.text();
//       console.log("📥 Raw Response:", responseText);
      
//       let scrapedData;
//       try {
//         scrapedData = JSON.parse(responseText);
//       } catch {
//         scrapedData = { 
//           status: 'success',
//           message: responseText,
//           timestamp: new Date().toISOString()
//         };
//       }

//       console.log('Processed Scraped Data:', scrapedData);

//       // Check if connected to Excel node and export data
//       const isConnectedToExcel = data.isExcelConnected?.(data.edges, data.nodes);
//       if (isConnectedToExcel) {
//         console.log("Excel Node is connected. Storing data in Excel...");
//         await exportDataToExcel();
//       }

//       return scrapedData;
  
//     } catch (error) {
//       console.error('Scraper Error:', error);
//       return {
//         status: 'error',
//         error: error.message,
//         timestamp: new Date().toISOString()
//       };
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // Function to export data to Excel
//   const exportDataToExcel = async () => {
//     try {
//       const response = await fetch("http://localhost:8080/api/exportExcel", {
//         method: "GET",
//         headers: { "Content-Type": "application/octet-stream" },
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to store data in Excel: ${response.status}`);
//       }

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "scraped_data.xlsx";
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);

//       console.log("📂 Data successfully Downloaded");
//     } catch (error) {
//       console.error("Excel Storage Error:", error.message);
//     }
//   };

//   // Register the execute function with the workflow
//   if (data.registerExecute) {
//     data.registerExecute('AiScraper', handleExecute);
//   }

//   return (
//     <BaseNode 
//       data={{ ...data, onExecute: handleExecute }}
//       id={id}
//     >
//       <Typography style={{ color: '#bbb', fontSize: '0.875rem' }}>
//         {isProcessing ? 'Scraping...' : 'Ready to scrape'}
//       </Typography>
//     </BaseNode>
//   );
// }

// AiScraperNode.propTypes = {
//   data: PropTypes.shape({
//     label: PropTypes.string.isRequired,
//     type: PropTypes.string.isRequired,
//     onDelete: PropTypes.func.isRequired,
//     isExcelConnected: PropTypes.func,
//     registerExecute: PropTypes.func,
//     getChatCallback: PropTypes.func,
//   }).isRequired,
//   id: PropTypes.string.isRequired,
// };  
import { useState } from 'react';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import BaseNode from './BaseNode';

export default function AiScraperNode({ data, id }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExecute = async (inputData) => {
    setIsProcessing(true);
    try {
      let businessType, location;

      // Handle input from ClickTriggerNode (JSON configuration)
      if (inputData && inputData.businessType && inputData.location) {
        businessType = inputData.businessType;
        location = inputData.location;
      }
      // Handle input from ChatTriggerNode (user prompts)
      else {
        const askQuestion = data.getChatCallback?.('ChatTrigger');
        if (!askQuestion) {
          throw new Error('Chat Trigger not connected');
        }

        // Ask for business type
        businessType = await askQuestion('What type of business are you looking for?');
        if (!businessType) throw new Error('Business type is required');

        // Ask for location
        location = await askQuestion('Where would you like to search?');
        if (!location) throw new Error('Location is required');
      }

      console.log(`Scraping for: ${businessType} in ${location}`);
      const response = await fetch(
        `http://localhost:8080/api/scrape?businessType=${businessType}&location=${location}`,
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
      
      let scrapedData;
      try {
        scrapedData = JSON.parse(responseText);
      } catch {
        scrapedData = { 
          status: 'success',
          message: responseText,
          timestamp: new Date().toISOString()
        };
      }

      console.log('Processed Scraped Data:', scrapedData);

      // Check if connected to Excel node and export data
      const isConnectedToExcel = data.isExcelConnected?.(data.edges, data.nodes);
      if (isConnectedToExcel) {
        console.log("Excel Node is connected. Storing data in Excel...");
        await exportDataToExcel();
      }

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

  // Function to export data to Excel
  const exportDataToExcel = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/exportExcel", {
        method: "GET",
        headers: { "Content-Type": "application/octet-stream" },
      });

      if (!response.ok) {
        throw new Error(`Failed to store data in Excel: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "scraped_data.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      console.log("📂 Data successfully Downloaded");
    } catch (error) {
      console.error("Excel Storage Error:", error.message);
    }
  };

  // Register the execute function with the workflow
  if (data.registerExecute) {
    data.registerExecute('AiScraper', handleExecute);
  }

  return (
    <BaseNode 
      data={{ ...data, onExecute: handleExecute }}
      id={id}
    >
      <Typography style={{ color: '#bbb', fontSize: '0.875rem' }}>
        {isProcessing ? 'Scraping...' : 'Ready to scrape'}
      </Typography>
    </BaseNode>
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