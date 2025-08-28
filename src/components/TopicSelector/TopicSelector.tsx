'use client';

import React from 'react';
import { DEMOLITION_TOPICS } from '@/types/blog.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hammer, ChevronDown } from 'lucide-react';

interface TopicSelectorProps {
  selectedTopic: string;
  customTopic: string;
  onTopicSelect: (topic: string) => void;
  onCustomTopicChange: (topic: string) => void;
  disabled?: boolean;
}

export function TopicSelector({
  selectedTopic,
  customTopic,
  onTopicSelect,
  onCustomTopicChange,
  disabled = false,
}: TopicSelectorProps) {
  const [showMore, setShowMore] = React.useState(false);
  const displayedTopics = showMore ? DEMOLITION_TOPICS : DEMOLITION_TOPICS.slice(0, 4);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hammer className="h-5 w-5 text-orange-500" />
          Select a Topic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {displayedTopics.map((topic) => (
            <Button
              key={topic.value}
              variant={selectedTopic === topic.value ? "default" : "outline"}
              className="justify-start text-left h-auto p-3"
              onClick={() => onTopicSelect(topic.value)}
              disabled={disabled}
            >
              <span className="truncate">{topic.label}</span>
            </Button>
          ))}
        </div>
        
        {!showMore && DEMOLITION_TOPICS.length > 4 && (
          <Button
            variant="ghost"
            onClick={() => setShowMore(true)}
            className="w-full"
            disabled={disabled}
          >
            <ChevronDown className="mr-2 h-4 w-4" />
            Show More Topics
          </Button>
        )}
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or enter custom topic
            </span>
          </div>
        </div>
        
        <div>
          <input
            type="text"
            placeholder="Enter your own demolition topic..."
            value={customTopic}
            onChange={(e) => onCustomTopicChange(e.target.value)}
            disabled={disabled}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </CardContent>
    </Card>
  );
}