import { useCallback } from 'react';
import { useBlogStore } from '@/store/blogStore';
import { useWebhook } from './useWebhook';
import { GenerationOptions } from '@/types/blog.types';
import { toast } from 'react-hot-toast';

export function useBlogGenerator() {
  const {
    currentTopic,
    customTopic,
    generationStatus,
    currentBlog,
    setTopic,
    setCustomTopic,
  } = useBlogStore();

  const { generate, streamGenerate, cancelGeneration, isGenerating } = useWebhook();

  const handleGenerate = useCallback(
    async (options?: Partial<GenerationOptions>) => {
      const topic = customTopic || currentTopic;
      
      if (!topic) {
        toast.error('Please select or enter a topic');
        return;
      }

      // Prefer streaming if available
      try {
        await streamGenerate(topic, options);
      } catch (error) {
        // Fallback to regular generation
        generate({ topic, options });
      }
    },
    [currentTopic, customTopic, generate, streamGenerate]
  );

  const handleTopicChange = useCallback(
    (topic: string) => {
      setTopic(topic);
      if (topic) {
        setCustomTopic(''); // Clear custom topic when selecting predefined
      }
    },
    [setTopic, setCustomTopic]
  );

  const handleCustomTopicChange = useCallback(
    (topic: string) => {
      setCustomTopic(topic);
      if (topic) {
        setTopic(''); // Clear predefined topic when entering custom
      }
    },
    [setTopic, setCustomTopic]
  );

  return {
    currentTopic,
    customTopic,
    generationStatus,
    currentBlog,
    isGenerating,
    handleGenerate,
    handleTopicChange,
    handleCustomTopicChange,
    cancelGeneration,
  };
}