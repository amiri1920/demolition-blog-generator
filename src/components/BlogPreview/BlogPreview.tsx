'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BlogPost } from '@/types/blog.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Download, 
  FileText, 
  Code, 
  FileImage,
  Clock,
  Hash,
  Edit,
  Check
} from 'lucide-react';
import { copyToClipboard, exportAsMarkdown, exportAsHTML, exportAsPDF } from '@/utils/export';
import { blogPostToMarkdown } from '@/utils/markdown';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BlogPreviewProps {
  blogPost: BlogPost | null;
  isGenerating?: boolean;
  className?: string;
}

export function BlogPreview({
  blogPost,
  isGenerating = false,
  className,
}: BlogPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'markdown'>('preview');

  const handleCopy = async () => {
    if (!blogPost) return;
    
    try {
      await copyToClipboard(blogPostToMarkdown(blogPost));
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleExport = async (format: 'markdown' | 'html' | 'pdf') => {
    if (!blogPost) return;
    
    try {
      switch (format) {
        case 'markdown':
          await exportAsMarkdown(blogPost);
          toast.success('Markdown file downloaded!');
          break;
        case 'html':
          await exportAsHTML(blogPost);
          toast.success('HTML file downloaded!');
          break;
        case 'pdf':
          await exportAsPDF(blogPost);
          toast.success('PDF file downloaded!');
          break;
      }
    } catch (error) {
      toast.error(`Failed to export as ${format}`);
    }
  };

  if (!blogPost && !isGenerating) {
    return (
      <Card className={cn("flex items-center justify-center h-full", className)}>
        <CardContent className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Select a topic and generate a blog post to preview it here
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isGenerating && !blogPost) {
    return (
      <Card className={cn("flex items-center justify-center h-full", className)}>
        <CardContent className="text-center py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const markdownContent = blogPost ? blogPostToMarkdown(blogPost) : '';

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {blogPost?.title || 'Generating...'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab(activeTab === 'preview' ? 'markdown' : 'preview')}
            >
              {activeTab === 'preview' ? (
                <>
                  <Code className="w-4 h-4 mr-1" />
                  Markdown
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-1" />
                  Preview
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!blogPost}
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <div className="relative group">
              <Button
                variant="outline"
                size="sm"
                disabled={!blogPost}
              >
                <Download className="w-4 h-4" />
              </Button>
              {blogPost && (
                <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-background border rounded-md shadow-lg z-10">
                  <button
                    onClick={() => handleExport('markdown')}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent w-full text-left"
                  >
                    <FileText className="w-4 h-4" />
                    Markdown
                  </button>
                  <button
                    onClick={() => handleExport('html')}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent w-full text-left"
                  >
                    <Code className="w-4 h-4" />
                    HTML
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent w-full text-left"
                  >
                    <FileImage className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {blogPost && (
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {blogPost.readingTime} min read
            </span>
            <span className="flex items-center gap-1">
              <Hash className="w-4 h-4" />
              {blogPost.wordCount} words
            </span>
            {blogPost.keywords.length > 0 && (
              <span className="flex items-center gap-1 flex-wrap">
                {blogPost.keywords.slice(0, 3).map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded"
                  >
                    {keyword}
                  </span>
                ))}
                {blogPost.keywords.length > 3 && (
                  <span className="text-xs">+{blogPost.keywords.length - 3} more</span>
                )}
              </span>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-6">
        {activeTab === 'preview' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="prose prose-slate dark:prose-invert max-w-none"
          >
            {blogPost && (
              <>
                <blockquote>{blogPost.metaDescription}</blockquote>
                
                <h2>Introduction</h2>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {blogPost.introduction}
                </ReactMarkdown>
                
                <h2>Main Content</h2>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {blogPost.mainContent}
                </ReactMarkdown>
                
                <h2>Conclusion</h2>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {blogPost.conclusion}
                </ReactMarkdown>
                
                {blogPost.imageUrls && blogPost.imageUrls.length > 0 && (
                  <>
                    <h2>Images</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {blogPost.imageUrls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Demolition Image ${index + 1}`}
                          className="rounded-lg shadow-md"
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{markdownContent}</code>
            </pre>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}