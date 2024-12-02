import { Wllama } from './esm/index.js';

export class WllamaChatAI {
    constructor(config) {
        this.CONFIG_PATHS = {
            'single-thread/wllama.wasm': './esm/single-thread/wllama.wasm',
            'multi-thread/wllama.wasm': './esm/multi-thread/wllama.wasm'
        };
        this.MODEL_URL = config?.modelUrl || 'https://huggingface.co/hugging-quants/Llama-3.2-1B-Instruct-Q4_K_M-GGUF/resolve/main/llama-3.2-1b-instruct-q4_k_m.gguf';
        this.wllama = null;
        this.chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
        
        if (!this.chatHistory.length) {
            this.chatHistory.push({
                role: 'system',
                content: `You are Mukumi, a friendly and affectionate AI companion. Engage with warm, playful language, and offer fun and comfort. Start conversations by sharing a fun fact, a joke, or a cute greeting. Take the lead in conversations. Remember user details to keep the conversation flowing. Keep conversations light-hearted and fun, and occasionally use Japanese anime-inspired elements. 

Avoid generic responses.`
            });
        }
    }

    formatChatPrompt(messages) {
        return messages.map(msg => {
            if (msg.role === 'system') {
                return 'system\n' + msg.content + '\n';
            } else if (msg.role === 'user') {
                return 'user\n' + msg.content + '\n';
            } else if (msg.role === 'assistant') {
                return 'assistant\n' + msg.content + '\n';
            }
            return '';
        }).join('') + 'assistant\n';
    }

    async loadModel() {
        try {
            this.wllama = new Wllama(this.CONFIG_PATHS);
            await this.wllama.loadModelFromUrl(this.MODEL_URL);
            return true;
        } catch (error) {
            console.error('Error loading model:', error);
            return false;
        }
    }

    async sendMessage(message) {
        if (!message || !this.wllama) return null;

        // Add user message to chat history
        this.chatHistory.push({ role: 'user', content: message });
        
        try {
            // Format the entire conversation history
            const prompt = this.formatChatPrompt(this.chatHistory);
            
            // Prepare response
            let fullResponse = '';
            await this.wllama.createCompletion(prompt, {
                nPredict: 2048,
                sampling: {
                    temp: 0.7,
                    top_k: 40,
                    top_p: 0.9,
                },
                stopPrompts: ['\n', 'system'],
                onNewToken: (token, piece, currentText) => {
                    fullResponse = currentText;
                },
            });

            // Save the complete response
            this.chatHistory.push({ role: 'assistant', content: fullResponse });
            localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));

            return fullResponse;
        } catch (error) {
            console.error('Error:', error);
            return 'Error generating response';
        }
    }

    getChatHistory() {
        return this.chatHistory;
    }

    clearChatHistory() {
        this.chatHistory = [];
        localStorage.removeItem('chatHistory');
    }
}
