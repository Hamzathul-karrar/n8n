import { API_CONFIG } from '../config/api.config';

class GeminiService {
    async generateResponse(message, context = []) {
        try {
            // Create a system prompt that defines the assistant's role and capabilities
            const systemPrompt = {
                role: "system",
                content: `You are a helpful workflow assistant. You can help users with:
                - Creating and managing workflows
                - Understanding node functionalities
                - Troubleshooting workflow issues
                - Providing real-time suggestions
                - Answering questions about n8n and automation
                
                Keep responses concise and focused on the user's workflow needs.`
            };

            // Format conversation history
            const conversationHistory = [
                systemPrompt,
                ...context.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.text
                }))
            ];

            // Add the current message
            conversationHistory.push({
                role: 'user',
                content: message
            });

            const response = await fetch(`${API_CONFIG.API_BASE_URL}/api/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'HTTP-Referer': 'https://localhost:3000',
                    'X-Title': 'Workflow Assistant',
                    'Authorization': `Bearer ${API_CONFIG.GEMINI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: API_CONFIG.GEMINI_MODEL,
                    messages: conversationHistory,
                    temperature: 0.7,
                    max_tokens: 1000,
                    stream: false,
                    top_p: 0.9,
                    frequency_penalty: 0.5,
                    presence_penalty: 0.5
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error Details:', errorData);
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw error;
        }
    }

    // Helper method to analyze workflow data
    async analyzeWorkflow(workflowData) {
        try {
            const response = await this.generateResponse(
                `Analyze this workflow data and provide insights: ${JSON.stringify(workflowData)}`
            );
            return response;
        } catch (error) {
            console.error('Workflow Analysis Error:', error);
            throw error;
        }
    }

    // Helper method to get node suggestions
    async getNodeSuggestions(currentNodes) {
        try {
            const response = await this.generateResponse(
                `Based on these nodes: ${JSON.stringify(currentNodes)}, what nodes would you recommend adding next?`
            );
            return response;
        } catch (error) {
            console.error('Node Suggestions Error:', error);
            throw error;
        }
    }

    // Helper method to get troubleshooting help
    async getTroubleshootingHelp(error, context) {
        try {
            const response = await this.generateResponse(
                `Help troubleshoot this error in my workflow: ${error}\nContext: ${context}`
            );
            return response;
        } catch (error) {
            console.error('Troubleshooting Help Error:', error);
            throw error;
        }
    }
}

export const geminiService = new GeminiService(); 