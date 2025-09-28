import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { api } from '@/utils/api';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatBotProps {
  className?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: '1',
      text: "Hi! I'm SafetyBot 🤖 I'm here to help you learn about disaster safety and emergency preparedness. What would you like to know about?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const currentMessage = inputMessage.trim();
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.chatbot.sendMessage(currentMessage);

      if (response.data.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.response,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('Failed to get response from chatbot');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later or contact an adult for emergency help. Remember: Fire 🔥 101, Medical 🚑 108, Police 👮 100",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Memoize the chat button to prevent unnecessary re-renders
  const chatButton = useMemo(() => (
    <Button
      onClick={toggleChat}
      className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
        isOpen 
          ? 'bg-red-500 hover:bg-red-600' 
          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
      }`}
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <MessageCircle className="h-6 w-6" />
      )}
    </Button>
  ), [isOpen, toggleChat]);

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 h-96 shadow-2xl border-2 border-primary/20 bg-white rounded-lg transform transition-all duration-300 ease-in-out">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <h3 className="text-sm font-semibold">SafetyBot</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs opacity-90">Online</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChat}
                className="text-white hover:bg-white/20 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-0 flex flex-col h-80">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-[85%] ${
                        message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <Avatar className="h-6 w-6 mt-1 flex-shrink-0">
                        <AvatarFallback className={`text-xs ${
                          message.isUser 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        }`}>
                          {message.isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div
                        className={`rounded-lg p-2 text-sm ${
                          message.isUser
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-900 rounded-bl-none border'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.isUser ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <Avatar className="h-6 w-6 mt-1 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                          <Bot className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 rounded-lg rounded-bl-none p-2 border">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="text-xs text-gray-500">SafetyBot is typing...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Input Area */}
            <div className="p-3 border-t bg-gray-50">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about fire safety, earthquakes, floods..."
                  className="flex-1 text-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                🚨 For real emergencies: Fire 101 | Medical 108 | Police 100
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      {chatButton}
      
      {/* Notification Badge */}
      {!isOpen && (
        <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-xs text-white font-bold">!</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(ChatBot);