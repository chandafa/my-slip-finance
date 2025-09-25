"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { chatbot } from "@/ai/flows/chatbot";

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function ChatbotPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history for the AI
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      const response = await chatbot({ history, message: input });
      
      const botMessage: Message = { role: 'model', content: response.response };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = { role: 'model', content: 'Maaf, terjadi kesalahan. Silakan coba lagi.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)]">
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl font-bold">{t('chatbot_page_title')}</h1>
        <p className="text-muted-foreground">{t('chatbot_page_desc')}</p>
      </div>

      <Card className="w-full flex-grow flex flex-col">
        <CardContent ref={chatContainerRef} className="flex-grow overflow-auto p-4 space-y-4">
          {/* Initial message */}
          <div className="flex items-start gap-3">
             <Avatar className="w-8 h-8 border">
                <AvatarFallback><Bot className="w-5 h-5"/></AvatarFallback>
            </Avatar>
            <div className="bg-muted p-3 rounded-lg max-w-[80%]">
              <p className="text-sm">Halo! Saya asisten keuangan MySlip. Ada yang bisa saya bantu terkait keuangan Anda hari ini?</p>
            </div>
          </div>

          {/* Chat messages */}
          {messages.map((message, index) => (
            <div key={index} className={cn("flex items-start gap-3", message.role === 'user' && "justify-end")}>
              {message.role === 'model' && (
                <Avatar className="w-8 h-8 border">
                    <AvatarFallback><Bot className="w-5 h-5"/></AvatarFallback>
                </Avatar>
              )}
              <div className={cn(
                "p-3 rounded-lg max-w-[80%]",
                message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <p className="text-sm">{message.content}</p>
              </div>
               {message.role === 'user' && (
                <Avatar className="w-8 h-8 border">
                    <AvatarFallback><User className="w-5 h-5"/></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

           {isLoading && (
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8 border">
                <AvatarFallback><Bot className="w-5 h-5"/></AvatarFallback>
              </Avatar>
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin"/>
                    <p className="text-sm text-muted-foreground">Sedang mengetik...</p>
                </div>
              </div>
            </div>
          )}

        </CardContent>
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan Anda..." 
              disabled={isLoading}
            />
            <Button size="icon" type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
