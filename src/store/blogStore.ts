import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BlogPost, Message, GenerationStatus, DemolitionTopic } from '@/types/blog.types';
import { generateSessionId } from '@/lib/utils';

interface BlogStore {
  // State
  currentTopic: string;
  customTopic: string;
  generationStatus: GenerationStatus;
  currentBlog: BlogPost | null;
  conversationHistory: Message[];
  sessionId: string;
  generationHistory: BlogPost[];
  isDarkMode: boolean;
  
  // Actions
  setTopic: (topic: string) => void;
  setCustomTopic: (topic: string) => void;
  setGenerationStatus: (status: GenerationStatus) => void;
  setCurrentBlog: (blog: BlogPost | null) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearConversation: () => void;
  addToHistory: (blog: BlogPost) => void;
  clearHistory: () => void;
  resetSession: () => void;
  toggleDarkMode: () => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
}

export const useBlogStore = create<BlogStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentTopic: '',
      customTopic: '',
      generationStatus: 'idle',
      currentBlog: null,
      conversationHistory: [],
      sessionId: generateSessionId(),
      generationHistory: [],
      isDarkMode: false,
      
      // Actions
      setTopic: (topic) => set({ currentTopic: topic }),
      
      setCustomTopic: (topic) => set({ customTopic: topic }),
      
      setGenerationStatus: (status) => set({ generationStatus: status }),
      
      setCurrentBlog: (blog) => set({ currentBlog: blog }),
      
      addMessage: (message) => set((state) => ({
        conversationHistory: [
          ...state.conversationHistory,
          {
            ...message,
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
          },
        ],
      })),
      
      updateMessage: (id, updates) => set((state) => ({
        conversationHistory: state.conversationHistory.map((msg) =>
          msg.id === id ? { ...msg, ...updates } : msg
        ),
      })),
      
      clearConversation: () => set({ 
        conversationHistory: [],
        currentBlog: null,
        generationStatus: 'idle',
      }),
      
      addToHistory: (blog) => set((state) => ({
        generationHistory: [blog, ...state.generationHistory].slice(0, 10), // Keep last 10
      })),
      
      clearHistory: () => set({ generationHistory: [] }),
      
      resetSession: () => set({
        sessionId: generateSessionId(),
        conversationHistory: [],
        currentBlog: null,
        generationStatus: 'idle',
        currentTopic: '',
        customTopic: '',
      }),
      
      toggleDarkMode: () => set((state) => {
        const newMode = !state.isDarkMode;
        if (typeof window !== 'undefined') {
          document.documentElement.classList.toggle('dark', newMode);
        }
        return { isDarkMode: newMode };
      }),
    }),
    {
      name: 'demolition-blog-storage',
      partialize: (state) => ({
        generationHistory: state.generationHistory,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);