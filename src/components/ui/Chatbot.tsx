"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const PREDEFINED_QUESTIONS = [
  "How do I navigate to the next lecture?",
  "Where can I find my course progress?", 
  "How do I download course materials?",
  "Can I speed up/slow down the video?",
  "How do I ask the instructor a question?",
  "Where are my certificates stored?"
];

const BOT_RESPONSES: { [key: string]: string } = {
  "How do I navigate to the next lecture?": "You can navigate to the next lecture by clicking the 'Next' button below the video or selecting it from the course curriculum on the left sidebar.",
  "Where can I find my course progress?": "Your course progress is displayed in the left sidebar showing completed lectures with checkmarks. You can also view overall progress in your learner dashboard.",
  "How do I download course materials?": "Course materials and resources can be downloaded by clicking on the attachments or resources section under each lecture.",
  "Can I speed up/slow down the video?": "Yes! Use the video player controls to adjust playback speed. Most videos support 0.5x, 1x, 1.25x, 1.5x, and 2x speeds.",
  "How do I ask the instructor a question?": "You can ask questions in the Q&A section or discussion forum for each course. Look for the 'Ask a Question' button in the course interface.",
  "Where are my certificates stored?": "Completed course certificates are available in your learner dashboard under the 'My Certificates' section."
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm here to help you with your learning experience. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleQuestionClick = (question: string) => {
    addMessage(question, true);
    
    // Simulate bot response
    setTimeout(() => {
      const response = BOT_RESPONSES[question] || "I'm not sure about that. Please contact support for more help.";
      addMessage(response, false);
    }, 1000);
  };

  const getBotResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    // Check for keywords in the question
    if (lowerQuestion.includes('progress') || lowerQuestion.includes('track')) {
      return "You can track your progress in the course sidebar. Completed lectures are marked with a green checkmark, and your overall progress percentage is shown at the top.";
    } else if (lowerQuestion.includes('materials') || lowerQuestion.includes('resources') || lowerQuestion.includes('download')) {
      return "Course materials are available in each lecture. Look for the 'Resources' section below videos or in the lecture content area. You can download them by clicking on the attachment links.";
    } else if (lowerQuestion.includes('certificate') || lowerQuestion.includes('completion')) {
      return "Certificates are automatically generated when you complete 100% of the course. You can download it from your dashboard or the course completion page.";
    } else if (lowerQuestion.includes('video') || lowerQuestion.includes('speed') || lowerQuestion.includes('playback')) {
      return "You can control video playback using the video player controls. Most videos support different speeds (0.5x, 1x, 1.25x, 1.5x, 2x). Look for the settings gear icon in the video player.";
    } else if (lowerQuestion.includes('instructor') || lowerQuestion.includes('contact') || lowerQuestion.includes('question')) {
      return "You can contact your instructor through the 'Q&A' section or discussion forum for each course. Look for the 'Ask a Question' button in the course interface.";
    } else if (lowerQuestion.includes('next') || lowerQuestion.includes('navigate') || lowerQuestion.includes('lecture')) {
      return "You can navigate to the next lecture by clicking the 'Next' button below the video or selecting it from the course curriculum on the left sidebar.";
    } else if (lowerQuestion.includes('help') || lowerQuestion.includes('support')) {
      return "I'm here to help! You can ask me about course progress, materials, certificates, video controls, or navigation. What specific topic would you like help with?";
    } else {
      return "I'm sorry, I don't have a specific answer for that question. You can try rephrasing your question or contact our support team for more detailed assistance. Here are some topics I can help with: progress tracking, course materials, certificates, video controls, and navigation.";
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const currentInput = inputValue;
      addMessage(inputValue, true);
      setInputValue('');
      
      // Simulate bot response with intelligent matching
      setTimeout(() => {
        const response = getBotResponse(currentInput);
        addMessage(response, false);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Icon */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 h-96 z-50">
          <Card className="w-full h-full shadow-xl border bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b">
              <CardTitle className="text-lg">Learning Assistant</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <div className="flex flex-col h-[calc(100%-4rem)]">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message, index) => (
                  <div key={message.id}>
                    <div
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                          message.isUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                    
                    {/* Show quick questions after each bot message (not user messages) */}
                    {!message.isUser && index === messages.length - 1 && (
                      <div className="space-y-2 mt-3">
                        <div className="text-xs text-muted-foreground font-medium">Ask another question:</div>
                        <div className="space-y-1">
                          {PREDEFINED_QUESTIONS.map((question, qIndex) => (
                            <button
                              key={qIndex}
                              onClick={() => handleQuestionClick(question)}
                              className="w-full text-left p-2 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors border border-border/50"
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t bg-background">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your question..."
                    className="text-sm flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    size="icon"
                    className="h-9 w-9 flex-shrink-0"
                    disabled={!inputValue.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}