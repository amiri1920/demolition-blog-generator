import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { n8nService } from '@/services/n8nService';
import { useBlogStore } from '@/store/blogStore';
import { BlogPost, GenerationOptions } from '@/types/blog.types';

export function useWebhook() {
  const [isStreaming, setIsStreaming] = useState(false);
  const { 
    sessionId, 
    setGenerationStatus, 
    setCurrentBlog, 
    addToHistory,
    addMessage,
    updateMessage
  } = useBlogStore();

  const generateMutation = useMutation({
    mutationFn: async ({ 
      topic, 
      options 
    }: { 
      topic: string; 
      options?: Partial<GenerationOptions> 
    }) => {
      setGenerationStatus('generating');
      
      // Add user message
      addMessage({
        role: 'user',
        content: topic,
      });
      
      // Add assistant loading message
      const assistantMessageId = `msg_${Date.now()}`;
      addMessage({
        role: 'assistant',
        content: 'Generating your demolition industry blog post...',
        loading: true,
      });

      try {
        const blogPost = await n8nService.generateBlog(topic, sessionId, options);
        
        // Update assistant message with success
        updateMessage(assistantMessageId, {
          content: `Successfully generated: "${blogPost.title}"`,
          loading: false,
        });
        
        return blogPost;
      } catch (error) {
        // Update assistant message with error
        updateMessage(assistantMessageId, {
          content: `Error: ${error instanceof Error ? error.message : 'Failed to generate blog'}`,
          loading: false,
        });
        throw error;
      }
    },
    onSuccess: (data: BlogPost) => {
      setCurrentBlog(data);
      addToHistory(data);
      setGenerationStatus('complete');
      toast.success('Blog post generated successfully!');
    },
    onError: (error: Error) => {
      setGenerationStatus('error');
      toast.error(error.message || 'Failed to generate blog post');
    },
  });

  const streamGenerate = useCallback(
    async (topic: string, options?: Partial<GenerationOptions>) => {
      if (isStreaming) return;
      
      setIsStreaming(true);
      setGenerationStatus('generating');
      
      // Add user message
      addMessage({
        role: 'user',
        content: topic,
      });
      
      // Add assistant loading message
      const assistantMessageId = `msg_${Date.now()}`;
      addMessage({
        role: 'assistant',
        content: 'Starting blog generation...',
        loading: true,
      });

      try {
        const blogPost = await n8nService.streamBlog(
          topic,
          sessionId,
          options,
          (partial) => {
            setCurrentBlog(partial as BlogPost);
          }
        );
        
        updateMessage(assistantMessageId, {
          content: `Successfully generated: "${blogPost.title}"`,
          loading: false,
        });
        
        setCurrentBlog(blogPost);
        addToHistory(blogPost);
        setGenerationStatus('complete');
        toast.success('Blog post generated successfully!');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate blog';
        
        updateMessage(assistantMessageId, {
          content: `Error: ${errorMessage}`,
          loading: false,
        });
        
        setGenerationStatus('error');
        toast.error(errorMessage);
      } finally {
        setIsStreaming(false);
      }
    },
    [sessionId, isStreaming, setGenerationStatus, setCurrentBlog, addToHistory, addMessage, updateMessage]
  );

  const cancelGeneration = useCallback(() => {
    n8nService.cancelGeneration();
    setIsStreaming(false);
    setGenerationStatus('idle');
    toast('Generation cancelled', { icon: 'ℹ️' });
  }, [setGenerationStatus]);

  return {
    generate: generateMutation.mutate,
    streamGenerate,
    cancelGeneration,
    isGenerating: generateMutation.isPending || isStreaming,
    error: generateMutation.error,
  };
}