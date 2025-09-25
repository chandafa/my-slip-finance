"use client";

import { useTranslation } from "@/hooks/use-translation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export default function ChatbotPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold">{t('chatbot_page_title')}</h1>
        <p className="text-muted-foreground">{t('chatbot_page_desc')}</p>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-2xl h-[60vh] flex flex-col">
          <CardHeader>
            <CardTitle>Chatbot</CardTitle>
            <CardDescription>This is a placeholder for the chatbot interface.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto p-4 space-y-4">
            {/* Chat messages will go here */}
            <div className="flex items-start gap-3">
              <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                <p className="text-sm">Hello! How can I assist you today?</p>
              </div>
            </div>
             <div className="flex items-start gap-3 justify-end">
              <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-br-none">
                <p className="text-sm">I have a question about my bill.</p>
              </div>
            </div>
          </CardContent>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input placeholder="Type your message..." />
              <Button size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
