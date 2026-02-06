'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { chatWithTrafficAI } from '@/lib/actions';
import { TrafficData } from '@/lib/types';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'bot';
  text: string;
};

export default function TrafficChatbot({ trafficContext }: { trafficContext: TrafficData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hello! I am your Jakarta Traffic Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithTrafficAI(userMsg, trafficContext);
      setMessages(prev => [...prev, { role: 'bot', text: response.reply }]);
    } catch (error) {
      console.error('Chat failed:', error);
      setMessages(prev => [...prev, { role: 'bot', text: "I'm sorry, I'm having trouble thinking right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-80 md:w-96 h-[500px] flex flex-col shadow-2xl border-primary/20 animate-in slide-in-from-bottom-5 duration-300">
          <CardHeader className="p-4 border-b flex flex-row items-center justify-between bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-white/20">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Traffic Assistant</CardTitle>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider">AI Live</span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary-foreground hover:bg-white/10" 
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden bg-muted/5">
            <ScrollArea className="h-full p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      "max-w-[85%] rounded-2xl p-3 text-sm shadow-sm",
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-card text-foreground border rounded-tl-none'
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-card border text-foreground rounded-2xl rounded-tl-none p-3 text-sm shadow-sm flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-primary animate-spin" />
                      <span className="animate-pulse">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-3 border-t gap-2 bg-card">
            <Input 
              placeholder="Ask anything about traffic..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="text-sm rounded-xl focus-visible:ring-primary/20"
              disabled={isLoading}
            />
            <Button 
              size="icon" 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()}
              className="rounded-xl shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Button 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-2xl hover:scale-105 transition-transform" 
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-7 w-7" />
        </Button>
      )}
    </div>
  );
}
