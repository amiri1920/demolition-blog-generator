export interface BlogPost {
  id: string;
  title: string;
  metaDescription: string;
  introduction: string;
  mainContent: string;
  conclusion: string;
  imageUrls: string[];
  keywords: string[];
  timestamp: string;
  wordCount: number;
  readingTime: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  loading?: boolean;
}

export interface GenerationOptions {
  tone: 'professional' | 'casual' | 'technical' | 'educational';
  wordCount: number;
  keywords: string[];
  generateImages: boolean;
}

export interface WebhookRequest {
  chatInput: string;
  sessionId: string;
  options?: GenerationOptions;
}

export interface WebhookResponse {
  success: boolean;
  data?: BlogPost;
  error?: string;
  streamId?: string;
}

export type GenerationStatus = 'idle' | 'generating' | 'complete' | 'error';

export interface AppState {
  currentTopic: string;
  generationStatus: GenerationStatus;
  blogContent: BlogPost | null;
  conversationHistory: Message[];
  sessionId: string;
  generationHistory: BlogPost[];
}

export const DEMOLITION_TOPICS = [
  { value: 'manual-vs-mechanical', label: 'Manual vs Mechanical Demolition' },
  { value: 'commercial-equipment', label: 'Commercial Demolition Equipment Types' },
  { value: 'safety-protocols', label: 'Safety Protocols in High-Rise Demolition' },
  { value: 'environmental', label: 'Environmental Considerations in Demolition' },
  { value: 'cost-factors', label: 'Cost Factors in Demolition Projects' },
  { value: 'asbestos-removal', label: 'Asbestos Removal Procedures' },
  { value: 'explosive-demolition', label: 'Explosive Demolition Techniques' },
  { value: 'residential-vs-commercial', label: 'Residential vs Commercial Demolition' },
] as const;

export type DemolitionTopic = typeof DEMOLITION_TOPICS[number]['value'];

export interface DemolitionTopicInfo {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface ExportFormat {
  type: 'markdown' | 'html' | 'pdf';
  filename: string;
  content: string;
}