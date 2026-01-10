import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Send, User, Sparkles, X, Minimize2, Maximize2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MatchAssistantChatProps {
  userName: string;
}

const MatchAssistantChat = ({ userName }: MatchAssistantChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello ${userName.split(' ')[0]}! 👋 I'm Vikshana, your AI matchmaking assistant. I can help you find compatible matches based on your preferences. Ask me anything like:\n\n• "Show me matches from my city"\n• "Find educated professionals"\n• "Who matches my preferences?"\n\nHow can I help you today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/match-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({
              role: m.role,
              content: m.content,
            })),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      // Add empty assistant message to start streaming into
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: assistantContent,
                };
                return updated;
              });
            }
          } catch {
            // Incomplete JSON, put it back
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: assistantContent,
                };
                return updated;
              });
            }
          } catch {
            /* ignore */
          }
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
      // Remove the empty assistant message if there was an error
      if (!assistantContent) {
        setMessages(prev => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-400 z-50"
        size="icon"
      >
        <Sparkles className="h-6 w-6 text-white" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 cursor-pointer"
        onClick={() => setIsMinimized(false)}
      >
        <Card className="w-64 shadow-lg border-primary/20">
          <CardHeader className="p-3 bg-gradient-to-r from-primary to-amber-500 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-white" />
                <span className="font-semibold text-white text-sm">Match Assistant</span>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(false);
                  }}
                >
                  <Maximize2 className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[500px] max-h-[70vh] shadow-xl z-50 flex flex-col border-primary/20">
      <CardHeader className="p-3 bg-gradient-to-r from-primary to-amber-500 rounded-t-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-white" />
            <CardTitle className="text-base text-white">AI Match Assistant</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-white hover:bg-white/20"
              onClick={() => setIsMinimized(true)}
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback
                  className={
                    message.role === 'assistant'
                      ? 'bg-gradient-to-r from-primary to-amber-500 text-white'
                      : 'bg-muted'
                  }
                >
                  {message.role === 'assistant' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-2">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-r from-primary to-amber-500 text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg px-3 py-2 bg-muted">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <span
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <CardContent className="p-3 border-t flex-shrink-0">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Ask about matches..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchAssistantChat;
