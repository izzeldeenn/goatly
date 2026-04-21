// Hugging Face API Service - Free AI Integration

export interface HuggingFaceMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

export class HuggingFaceService {
  private static instance: HuggingFaceService;
  private apiKey: string;
  private apiUrl: string;

  private constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY || '';
    // Using free Serverless Inference API with Mistral-7B model
    this.apiUrl = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
  }

  static getInstance(): HuggingFaceService {
    if (!HuggingFaceService.instance) {
      HuggingFaceService.instance = new HuggingFaceService();
    }
    return HuggingFaceService.instance;
  }

  async chat(messages: HuggingFaceMessage[]): Promise<string> {
    try {
      // Use server-side API route to avoid CORS issues
      const prompt = this.formatMessages(messages);

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API error:', errorText);
        return `Error: ${response.status} - ${errorText}`;
      }

      const data = await response.json();
      
      if (data.response) {
        return data.response;
      }

      return 'No response generated';
    } catch (error) {
      console.error('Hugging Face service error:', error);
      return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private formatMessages(messages: HuggingFaceMessage[]): string {
    // Format messages for Mistral model
    return messages
      .map(msg => {
        if (msg.role === 'system') {
          return `<s>[INST] ${msg.content} [/INST]`;
        } else if (msg.role === 'user') {
          return `[INST] ${msg.content} [/INST]`;
        } else {
          return `${msg.content}`;
        }
      })
      .join('\n');
  }

  private extractAssistantResponse(fullResponse: string, prompt: string): string {
    // Remove the prompt from the response to get only the assistant's message
    const response = fullResponse.replace(prompt, '').trim();
    return response || fullResponse;
  }

  async setApiKey(apiKey: string): Promise<void> {
    this.apiKey = apiKey;
  }
}

export const huggingFaceService = HuggingFaceService.getInstance();
