'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Download, Copy, Check, Menu, Plus, Search, Settings, Moon, Sun, ChevronRight, Trash2, Edit3, MoreVertical, User, Bot, History, FileText, Archive, Shield, Wrench, Building, HardHat, AlertTriangle, Zap, Flame, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import axios from 'axios';
import { useChatStore } from '@/store/chatStore';
import { BlogService } from '@/services/n8nService';
import { DemolitionTopicInfo } from '@/types/blog.types';
import { MessageDisplay } from './MessageDisplay';
import { cn } from '@/lib/utils';

const DEMOLITION_TOPICS: DemolitionTopicInfo[] = [
  {
    id: 'safety-protocols',
    name: 'Safety Protocols',
    description: 'Essential safety measures and compliance requirements for demolition projects',
    icon: Shield,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-200 dark:border-green-800'
  },
  {
    id: 'explosive-demolition',
    name: 'Explosive Demolition',
    description: 'Controlled implosion techniques and explosive handling procedures',
    icon: Flame,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  {
    id: 'mechanical-demolition',
    name: 'Mechanical Demolition',
    description: 'Heavy machinery operations and mechanical dismantling methods',
    icon: Wrench,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  {
    id: 'structural-assessment',
    name: 'Structural Assessment',
    description: 'Building analysis and structural integrity evaluation techniques',
    icon: Building,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  {
    id: 'waste-management',
    name: 'Waste Management',
    description: 'Recycling, disposal, and environmental compliance in demolition',
    icon: Archive,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    borderColor: 'border-emerald-200 dark:border-emerald-800'
  },
  {
    id: 'project-planning',
    name: 'Project Planning',
    description: 'Timeline management, cost estimation, and resource allocation',
    icon: FileText,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    borderColor: 'border-orange-200 dark:border-orange-800'
  },
  {
    id: 'equipment-tools',
    name: 'Equipment & Tools',
    description: 'Selection, maintenance, and operation of demolition equipment',
    icon: HardHat,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    borderColor: 'border-yellow-200 dark:border-yellow-800'
  },
  {
    id: 'emergency-procedures',
    name: 'Emergency Procedures',
    description: 'Crisis management and emergency response protocols',
    icon: AlertTriangle,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950',
    borderColor: 'border-rose-200 dark:border-rose-800'
  }
];

export function ChatInterface() {
  const { currentChat, chats, messages, addMessage, createNewChat, setCurrentChat, deleteChat, updateChatTitle, theme, toggleTheme } = useChatStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTopics, setShowTopics] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const currentMessages = currentChat ? messages[currentChat] || [] : [];
  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [currentMessages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const userMessage = input.trim();
      setInput('');
      setShowTopics(false);
      
      let chatId = currentChat;
      let sessionId: string;
      
      if (!chatId) {
        chatId = createNewChat(userMessage.slice(0, 50));
        setCurrentChat(chatId);
      }
      
      // Get the sessionId from the current chat
      const chat = chats.find(c => c.id === chatId);
      sessionId = chat?.sessionId || `demolition_blog_${chatId}`;
      
      addMessage(chatId, {
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      setIsLoading(true);
      
      try {
        const response = await BlogService.generateBlog({
          topic: userMessage,
          sessionId,  // Pass the persistent sessionId
          style: 'professional',
          length: 'medium',
          tone: 'informative'
        });

        // Format the response for better display
        let formattedContent = response.content;
        
        // If we have structured data, format it nicely
        if (response.title && response.introduction && response.mainContent) {
          formattedContent = `# ${response.title}\n\n`;
          if (response.metaDescription) {
            formattedContent += `*${response.metaDescription}*\n\n---\n\n`;
          }
          formattedContent += `## Introduction\n${response.introduction}\n\n`;
          formattedContent += `## Main Content\n${response.mainContent}\n\n`;
          if (response.conclusion) {
            formattedContent += `## Conclusion\n${response.conclusion}\n\n`;
          }
          if (response.keywords && response.keywords.length > 0) {
            formattedContent += `---\n**Keywords:** ${response.keywords.join(', ')}\n`;
          }
          if (response.wordCount) {
            formattedContent += `**Word Count:** ${response.wordCount} | **Reading Time:** ${response.readingTime} min\n`;
          }
        }

        addMessage(currentChat!, {
          role: 'assistant',
          content: formattedContent,
          timestamp: new Date()
        });
        
        // Show success toast
        toast('✓', { 
          description: 'Blog post generated successfully!',
          duration: 3000
        });
      } catch (error) {
        console.error('Error generating blog:', error);
        
        let errorMessage = 'I apologize, but I encountered an error while generating the blog post. Please try again.';
        
        if (axios.isAxiosError(error)) {
          if (error.message.includes('background execution')) {
            errorMessage = 'The n8n workflow needs configuration. Please set the Chat Trigger to "Respond to Webhook" mode instead of background execution.';
          } else {
            errorMessage = `Connection error: ${error.message}. Please check your n8n webhook is active.`;
          }
        }
        
        addMessage(currentChat!, {
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date()
        });
        
        toast('✗', { 
          description: 'Failed to generate blog post',
          duration: 4000
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTopicSelect = (topic: DemolitionTopicInfo) => {
    setInput(`Write a comprehensive blog post about ${topic.name.toLowerCase()} in the demolition industry, covering ${topic.description.toLowerCase()}`);
    setShowTopics(false);
    textareaRef.current?.focus();
  };

  const handleNewChat = () => {
    const chatId = createNewChat();
    setCurrentChat(chatId);
    setShowTopics(true);
    setInput('');
  };

  const handleExport = (format: 'markdown' | 'json' | 'copy') => {
    const content = currentMessages.map(m => 
      `${m.role === 'user' ? '### User' : '### Assistant'}\\n\\n${m.content}`
    ).join('\\n\\n---\\n\\n');

    switch (format) {
      case 'markdown':
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-${currentChat || 'export'}.md`;
        a.click();
        toast('✓', { description: 'Chat exported as Markdown' });
        break;
      
      case 'json':
        const jsonBlob = new Blob([JSON.stringify(currentMessages, null, 2)], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonA = document.createElement('a');
        jsonA.href = jsonUrl;
        jsonA.download = `chat-${currentChat || 'export'}.json`;
        jsonA.click();
        toast('✓', { description: 'Chat exported as JSON' });
        break;
      
      case 'copy':
        navigator.clipboard.writeText(content);
        setCopiedId('export');
        setTimeout(() => setCopiedId(null), 2000);
        toast('✓', { description: 'Chat copied to clipboard' });
        break;
    }
  };

  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast('✓', { description: 'Message copied to clipboard' });
  };

  return (
    <TooltipProvider>
      <div className={cn("flex h-screen bg-gradient-to-br", theme === 'dark' ? 'from-gray-950 via-gray-900 to-gray-950' : 'from-gray-50 via-white to-gray-50')}>
        {/* Sidebar */}
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="p-0 w-80 border-r border-gray-200 dark:border-gray-800">
            <div className="flex flex-col h-full">
              <SheetHeader className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                    Demolition AI
                  </SheetTitle>
                  <Button
                    onClick={handleNewChat}
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    New Chat
                  </Button>
                </div>
              </SheetHeader>
              
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1 px-2">
                <div className="space-y-1">
                  {filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={cn(
                        "group flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors",
                        currentChat === chat.id && "bg-gradient-to-r from-orange-100 to-red-50 dark:from-orange-950 dark:to-red-950"
                      )}
                      onClick={() => {
                        setCurrentChat(chat.id);
                        setIsSidebarOpen(false);
                        setShowTopics(false);
                      }}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                          <History className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{chat.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(chat.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            const newTitle = prompt('Enter new title:', chat.title);
                            if (newTitle) updateChatTitle(chat.id, newTitle);
                          }}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(chat.id);
                            }}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => toggleTheme()}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 mr-2" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 mr-2" />
                      Dark Mode
                    </>
                  )}
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                  Demolition Blog Generator
                </h1>
              </div>
            </div>
            
            {currentChat && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('markdown')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('copy')}>
                    {copiedId === 'export' ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    Copy to Clipboard
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </header>

          {/* Chat Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="max-w-4xl mx-auto">
              {showTopics && currentMessages.length === 0 && (
                <div className="space-y-8 py-12">
                  <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                      What would you like to write about today?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                      Choose a topic below or describe your own demolition industry topic
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DEMOLITION_TOPICS.map((topic) => {
                      const Icon = topic.icon;
                      return (
                        <div
                          key={topic.id}
                          className={cn(
                            "group relative p-6 rounded-xl border-2 transition-all hover:shadow-xl cursor-pointer",
                            topic.bgColor,
                            topic.borderColor,
                            "hover:scale-[1.02]"
                          )}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={cn("p-3 rounded-lg", topic.bgColor)}>
                              <Icon className={cn("w-6 h-6", topic.color)} />
                            </div>
                            <div className="flex-1 space-y-2">
                              <h3 className="font-semibold text-lg">{topic.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {topic.description}
                              </p>
                              <Button
                                size="sm"
                                onClick={() => handleTopicSelect(topic)}
                                className="mt-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                              >
                                Use this template
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {currentMessages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start space-x-3 mb-6",
                    message.role === 'user' && "justify-end"
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600">
                        <Bot className="w-5 h-5 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={cn(
                      "group relative max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === 'user' 
                        ? "bg-gradient-to-r from-orange-500 to-red-600 text-white ml-auto"
                        : "bg-gray-100 dark:bg-gray-800"
                    )}
                  >
                    <MessageDisplay content={message.content} isUser={message.role === 'user'} />
                    <div className={cn(
                      "absolute -bottom-5 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity",
                      message.role === 'user' ? "right-0" : "left-0"
                    )}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyMessage(message.content, `msg-${index}`)}
                            className="h-7 px-2"
                          >
                            {copiedId === `msg-${index}` ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy message</TooltipContent>
                      </Tooltip>
                      
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600">
                      <Bot className="w-5 h-5 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Generating your blog post...</span>
                    </div>
                    <div className="flex space-x-1 mt-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Describe your demolition blog topic..."
                    className="resize-none pr-12 min-h-[56px] max-h-[200px] rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-500"
                    disabled={isLoading}
                  />
                  <Badge className="absolute bottom-2 right-2 text-xs" variant="outline">
                    {input.length} chars
                  </Badge>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="lg"
                  className="h-14 px-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Press <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded">Enter</kbd> to send, 
                <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded ml-1">Shift+Enter</kbd> for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}