import axios, { AxiosError } from 'axios';
import { BlogPost, WebhookRequest, WebhookResponse, GenerationOptions } from '@/types/blog.types';
import { calculateReadingTime, calculateWordCount } from '@/lib/utils';
import { mockBlogPost, mockTopicResponses } from './mockData';

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '';
const API_TIMEOUT = 30000; // 30 seconds

export class N8nService {
  private static instance: N8nService;
  private abortController: AbortController | null = null;

  static getInstance(): N8nService {
    if (!N8nService.instance) {
      N8nService.instance = new N8nService();
    }
    return N8nService.instance;
  }

  async generateBlog(
    topic: string,
    sessionId: string,
    options?: Partial<GenerationOptions>
  ): Promise<BlogPost> {
    // Use mock data in development if no webhook URL
    if (!N8N_WEBHOOK_URL && process.env.NODE_ENV === 'development') {
      console.log('Using mock data for development');
      return new Promise((resolve) => {
        setTimeout(() => {
          const topicData = mockTopicResponses[topic] || {};
          const blogPost = {
            ...mockBlogPost,
            ...topicData,
            id: `blog_${Date.now()}`,
            timestamp: new Date().toISOString(),
            keywords: options?.keywords || mockBlogPost.keywords,
          };
          resolve(blogPost);
        }, 1500); // Simulate network delay
      });
    }
    
    if (!N8N_WEBHOOK_URL) {
      throw new Error('N8N webhook URL is not configured');
    }

    this.abortController = new AbortController();

    const request: WebhookRequest = {
      chatInput: topic,
      sessionId,
      options: {
        tone: options?.tone || 'professional',
        wordCount: options?.wordCount || 1200,
        keywords: options?.keywords || [],
        generateImages: options?.generateImages !== false,
      },
    };

    try {
      const response = await axios.post<WebhookResponse>(
        N8N_WEBHOOK_URL,
        request,
        {
          timeout: API_TIMEOUT,
          signal: this.abortController.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to generate blog post');
      }

      const blogPost = response.data.data;
      
      // Calculate word count and reading time if not provided
      const fullText = `${blogPost.introduction} ${blogPost.mainContent} ${blogPost.conclusion}`;
      blogPost.wordCount = blogPost.wordCount || calculateWordCount(fullText);
      blogPost.readingTime = blogPost.readingTime || calculateReadingTime(fullText);
      
      return blogPost;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.code === 'ECONNABORTED') {
          throw new Error('Request timeout - please try again');
        }
        if (axiosError.response?.status === 429) {
          throw new Error('Rate limit exceeded - please wait a moment');
        }
        const errorData = axiosError.response?.data as any;
        throw new Error(
          errorData?.error || 
          'Failed to connect to blog generator service'
        );
      }
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  async streamBlog(
    topic: string,
    sessionId: string,
    options?: Partial<GenerationOptions>,
    onUpdate?: (partial: Partial<BlogPost>) => void
  ): Promise<BlogPost> {
    // Use mock data in development if no webhook URL
    if (!N8N_WEBHOOK_URL && process.env.NODE_ENV === 'development') {
      console.log('Using mock streaming for development');
      return new Promise((resolve) => {
        const topicData = mockTopicResponses[topic] || {};
        const finalBlog = {
          ...mockBlogPost,
          ...topicData,
          id: `blog_${Date.now()}`,
          timestamp: new Date().toISOString(),
          keywords: options?.keywords || mockBlogPost.keywords,
        };
        
        // Simulate streaming updates
        setTimeout(() => onUpdate?.({ title: finalBlog.title }), 300);
        setTimeout(() => onUpdate?.({ metaDescription: finalBlog.metaDescription }), 600);
        setTimeout(() => onUpdate?.({ introduction: finalBlog.introduction }), 900);
        setTimeout(() => onUpdate?.({ mainContent: finalBlog.mainContent }), 1200);
        setTimeout(() => onUpdate?.({ conclusion: finalBlog.conclusion }), 1500);
        setTimeout(() => resolve(finalBlog), 1800);
      });
    }
    
    if (!N8N_WEBHOOK_URL) {
      throw new Error('N8N webhook URL is not configured');
    }

    // Check if SSE is supported
    const sseUrl = N8N_WEBHOOK_URL.replace('/webhook/', '/webhook-stream/');
    
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(
        `${sseUrl}?sessionId=${sessionId}&topic=${encodeURIComponent(topic)}`
      );

      let blogPost: Partial<BlogPost> = {
        id: `blog_${Date.now()}`,
        timestamp: new Date().toISOString(),
        title: '',
        metaDescription: '',
        introduction: '',
        mainContent: '',
        conclusion: '',
        imageUrls: [],
        keywords: options?.keywords || [],
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'partial') {
            blogPost = { ...blogPost, ...data.content };
            onUpdate?.(data.content);
          } else if (data.type === 'complete') {
            const fullText = `${blogPost.introduction} ${blogPost.mainContent} ${blogPost.conclusion}`;
            blogPost.wordCount = calculateWordCount(fullText);
            blogPost.readingTime = calculateReadingTime(fullText);
            
            eventSource.close();
            resolve(blogPost as BlogPost);
          } else if (data.type === 'error') {
            eventSource.close();
            reject(new Error(data.message));
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        eventSource.close();
        // Fallback to regular HTTP request if SSE fails
        this.generateBlog(topic, sessionId, options)
          .then(resolve)
          .catch(reject);
      };

      // Timeout handling
      setTimeout(() => {
        if (eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close();
          reject(new Error('Stream timeout - falling back to regular generation'));
        }
      }, API_TIMEOUT);
    });
  }

  cancelGeneration(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

export const n8nService = N8nService.getInstance();
export const BlogService = {
  generateBlog: async (options: { topic: string; sessionId?: string; style?: string; length?: string; tone?: string }) => {
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    // Use the provided sessionId or generate a new one
    const sessionId = options.sessionId || `${process.env.NEXT_PUBLIC_SESSION_PREFIX || ''}${Date.now()}`;
    
    console.log('BlogService: Starting generation with webhook URL:', webhookUrl);
    console.log('BlogService: Topic:', options.topic);
    console.log('BlogService: SessionId:', sessionId);
    console.log('BlogService: Using persistent session for chat continuity');
    
    // If we have a webhook URL, use the n8n chat endpoint
    if (webhookUrl) {
      try {
        console.log('BlogService: Sending request to n8n webhook...');
        const response = await axios.post(
          webhookUrl,
          {
            chatInput: options.topic,
            sessionId: sessionId
          },
          {
            timeout: 120000, // 120 seconds for AI generation (increased from 60)
            headers: {
              'Content-Type': 'application/json',
            },
            validateStatus: (status) => {
              // Accept any status code for now to see what n8n returns
              return status >= 200 && status < 500;
            }
          }
        );
        
        console.log('BlogService: Response status:', response.status);
        console.log('BlogService: Received response from n8n:', response.data);
        console.log('BlogService: Response type:', typeof response.data);
        
        // Handle error responses
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
        }
        
        if (response.status >= 400) {
          throw new Error(`n8n returned error status ${response.status}: ${JSON.stringify(response.data)}`);
        }
        
        // Handle n8n async workflow response
        if (response.data?.message === 'Workflow was started') {
          console.log('BlogService: n8n workflow started in background mode');
          throw new Error('n8n workflow is configured for background execution. Please configure your n8n workflow to "Respond to Webhook" instead of "Workflow was started" mode.');
        }
        
        // Handle various n8n response formats
        let aiResponse;
        if (typeof response.data === 'string') {
          // Direct string response
          aiResponse = response.data;
        } else if (response.data?.output) {
          // Wrapped in output property
          aiResponse = response.data.output;
        } else if (response.data?.text) {
          // Wrapped in text property
          aiResponse = response.data.text;
        } else if (response.data?.response) {
          // Wrapped in response property
          aiResponse = response.data.response;
        } else if (Array.isArray(response.data) && response.data.length > 0) {
          // Array response - take first item
          aiResponse = response.data[0]?.output || response.data[0]?.text || JSON.stringify(response.data[0]);
        } else {
          // Fallback to stringifying the response
          aiResponse = JSON.stringify(response.data);
        }
        
        console.log('BlogService: Parsed AI response:', aiResponse?.substring(0, 200) + '...');
        
        // Extract structured content from the AI response
        const titleMatch = aiResponse.match(/\*\*Title:\*\*\s*(.+?)(?:\n|$)/);
        const metaMatch = aiResponse.match(/\*\*Meta Description:\*\*\s*(.+?)(?:\n|$)/);
        const introMatch = aiResponse.match(/\*\*Introduction:\*\*\s*([\s\S]+?)(?=\*\*Main Content:|\*\*|$)/);
        const mainMatch = aiResponse.match(/\*\*Main Content:\*\*\s*([\s\S]+?)(?=\*\*Conclusion:|\*\*|$)/);
        const conclusionMatch = aiResponse.match(/\*\*Conclusion:\*\*\s*([\s\S]+?)(?=\*\*Image Prompts:|\*\*Keywords:|\*\*|$)/);
        const keywordsMatch = aiResponse.match(/\*\*Keywords:\*\*\s*(.+?)(?:\n|$)/);
        
        const blogPost: BlogPost = {
          id: `blog_${Date.now()}`,
          title: titleMatch?.[1]?.trim() || 'Demolition Industry Blog Post',
          metaDescription: metaMatch?.[1]?.trim() || '',
          introduction: introMatch?.[1]?.trim() || '',
          mainContent: mainMatch?.[1]?.trim() || aiResponse,
          conclusion: conclusionMatch?.[1]?.trim() || '',
          imageUrls: [],
          keywords: keywordsMatch?.[1]?.split(',').map((k: string) => k.trim()) || [],
          timestamp: new Date().toISOString(),
          wordCount: 0,
          readingTime: 0
        };
        
        // Calculate word count and reading time
        const fullText = `${blogPost.introduction} ${blogPost.mainContent} ${blogPost.conclusion}`;
        blogPost.wordCount = calculateWordCount(fullText);
        blogPost.readingTime = calculateReadingTime(fullText);
        
        return {
          content: aiResponse, // Return the full AI response as content
          ...blogPost
        };
      } catch (error) {
        console.error('n8n webhook error - Full details:', error);
        if (axios.isAxiosError(error)) {
          console.error('Response status:', error.response?.status);
          console.error('Response data:', error.response?.data);
          console.error('Request config:', error.config);
        }
        // Fall back to mock data if webhook fails
        const generationOptions: Partial<GenerationOptions> = {
          tone: (options.tone as any) || 'professional',
          wordCount: options.length === 'long' ? 2000 : options.length === 'short' ? 500 : 1200,
        };
        
        const blogPost = await n8nService.generateBlog(options.topic, sessionId, generationOptions);
        return {
          content: `# ${blogPost.title}\n\n${blogPost.introduction}\n\n${blogPost.mainContent}\n\n${blogPost.conclusion}`,
          ...blogPost
        };
      }
    } else {
      // No webhook URL, use mock data
      const generationOptions: Partial<GenerationOptions> = {
        tone: (options.tone as any) || 'professional',
        wordCount: options.length === 'long' ? 2000 : options.length === 'short' ? 500 : 1200,
      };
      
      const blogPost = await n8nService.generateBlog(options.topic, sessionId, generationOptions);
      return {
        content: `# ${blogPost.title}\n\n${blogPost.introduction}\n\n${blogPost.mainContent}\n\n${blogPost.conclusion}`,
        ...blogPost
      };
    }
  }
};