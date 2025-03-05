export class AiScraperService {
  static async executeScraping(businessType, location) {
    try {
      console.log(`Executing AI Scraper for: ${businessType} in ${location}`);
      const response = await fetch(
        `http://localhost:8080/api/scrape?businessType=${businessType}&location=${location}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
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
      return scrapedData;

    } catch (error) {
      console.error('Scraper Error:', error);
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  static async exportToExcel() {
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
      return true;
    } catch (error) {
      console.error("Excel Storage Error:", error.message);
      throw error;
    }
  }

  static async handleNodeExecution(inputData, chatCallback, isExcelConnected) {
    try {
      let businessType, location;

      // Handle input from ClickTriggerNode
      if (inputData && Array.isArray(inputData) && inputData.length > 0) {
        console.log('Using input from ClickTriggerNode:', inputData[0]);
        businessType = inputData[0].businessType;
        location = inputData[0].location;
      } 
      // Handle input from ChatTriggerNode
      else if (chatCallback) {
        businessType = await chatCallback('What type of business are you looking for?');
        if (!businessType) throw new Error('Business type is required');

        location = await chatCallback('Where would you like to search?');
        if (!location) throw new Error('Location is required');
      } else {
        throw new Error('No valid input source found');
      }

      const scrapedData = await this.executeScraping(businessType, location);

      // Check if Excel export is needed
      if (isExcelConnected) {
        console.log("Excel Node is connected. Storing data in Excel...");
        await this.exportToExcel();
      }

      return scrapedData;

    } catch (error) {
      console.error('AI Scraper Node Execution Error:', error);
      throw error;
    }
  }
} 