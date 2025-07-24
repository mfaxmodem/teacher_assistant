import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Settings, Menu, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

const ChatArea = ({ messages, onSendMessage, isLoading, setIsMobileOpen, user }) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  // Sample messages if none provided
  const sampleMessages = messages.length === 0 ? [] : messages;

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold">دستیار هوشمند</h1>
        <div className="w-8" /> {/* Spacer */}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {sampleMessages.length === 0 ? (
          // Welcome Screen
          <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
            <div className="mb-8">
        <div className="w-18 h-18 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto overflow-hidden">
        <img src="../src/assets/logo.png" alt="آیکن روش تدریس" className="w-full h-full object-cover" />
        </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                چطور می‌تونم کمکتون کنم؟
              </h1>
              <p className="text-gray-600">
                من آماده‌ام تا به سوالات شما پاسخ بدم و در انجام کارهایتان کمکتان کنم.
              </p>
            </div>
            
            {/* Suggestion Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">نوشتن روش تدریس</h3>
                <p className="text-sm text-gray-600">کمک در پیاده سازی روش تدریس، طرح سوال یا محتوای دیگر</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">حل مسئله</h3>
                <p className="text-sm text-gray-600">کمک در حل مسائل تخصصی، عمومی و غیره</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">امتحان یار</h3>
                <p className="text-sm text-gray-600">کمک در نحوه ایجاد سوالات خلاقانه</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <h3 className="font-medium text-gray-900 mb-1">آموزش</h3>
                <p className="text-sm text-gray-600">توضیح مفاهیم و آموزش موضوعات مختلف</p>
              </div>
            </div>
          </div>
        ) : (
          // Messages
          <div className="max-w-3xl mx-auto space-y-6">
            {sampleMessages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">چ</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">دستیار هوشمند</span>
                    </div>
                  )}
                  <div className={`p-3 rounded-2xl ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mt-2 justify-start">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-green-500 p-1"
                        onClick={() => onSendFeedback(message.id, 1)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-red-500 p-1"
                        onClick={() => onSendFeedback(message.id, -1)}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {message.role === 'user' && (
                    <div className="flex items-center gap-2 mt-2 justify-end">
                      <span className="text-sm text-gray-500">شما</span>
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-xs font-bold">ش</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
			
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">چ</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">دستیار هوشمند</span>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end gap-2 p-3 border border-gray-300 rounded-2xl bg-white focus-within:border-gray-400 transition-colors">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="پیام خود را بنویسید..."
                className="flex-1 border-0 resize-none focus:ring-0 focus:outline-none bg-transparent text-right min-h-[20px] max-h-[200px]"
                style={{ height: 'auto' }}
                disabled={isLoading}
              />
              
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                
                <Button
                  type="submit"
                  size="sm"
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            دستیار هوشمند ابزاری برای ایجاد محیطی علمی و پویا تر
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;

