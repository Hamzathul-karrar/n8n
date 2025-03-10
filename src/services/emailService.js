import axios from 'axios';

const sendDataToBackend = async (endpoint, payload) => {
    try {
      const response = await axios.post(`http://localhost:8080/api/${endpoint}`, payload);
      console.log(`Data sent to ${endpoint}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error sending data to ${endpoint}:`, error);
      throw error;
    }
  };

export const handleEmailSend = async () => {
    try {
    //   const connectedNodeData = isConnectedToRequiredNode();
    //   if(!connectedNodeData){
    //     throw new Error('No valid input node connected');
    //   }
    //   console.log("Connected node data:", connectedNodeData);
      console.log("Email node executing...");
      const username = sessionStorage.getItem('username');
      const password = sessionStorage.getItem('password');
      const jobType = sessionStorage.getItem('businessType');

      if (!username || !password) {
        console.error('User not logged in');
        throw new Error('User not logged in');
      }

      if (!jobType) {
        console.error('No business type found');
        throw new Error('No business type found');
      }

      const userResponse = await axios.get(
        `http://localhost:8080/api/getUser?username=${username}&password=${password}`
      );

      if (!userResponse.data) {
        throw new Error('User data not found');
      }
      console.log("User response:", userResponse.data);
      const { name: senderName, companyName, companyDescription, contactInfo } = userResponse.data;
      const payload = {
        // recipientEmail: "ak9009641@gmail.com",
        // recipientName: "Abhay",
        subject: "Business Email",
        jobtype: jobType,
        senderName: senderName,
        companyName: companyName,
        serviceDetails: companyDescription,
        contact: contactInfo,
      };

      await sendDataToBackend("send", payload);
      console.log('Email sent successfully:', payload);
      return { status: 'success', message: 'Email sent successfully' };

    } catch (error) {
      console.error('Error in email process:', error);
      throw error;
    }
  };