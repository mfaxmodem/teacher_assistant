import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import './App.css';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import AuthPage from './components/AuthPage';
import { Button } from './components/ui/button';
import apiService from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Load conversations when user logs in
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      const userConversations = await apiService.getConversations(user.id);
      setConversations(userConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  // Show auth page if user is not logged in
  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  const handleNewChat = async () => {
    try {
      // Clear current selection to start fresh
      setSelectedConversationId(null);
      setMessages([]);
      setIsMobileOpen(false);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSelectConversation = async (conversationId) => {
    setSelectedConversationId(conversationId);
    setIsMobileOpen(false);
    
    try {
      // Load messages for this conversation
      const conversationMessages = await apiService.getMessages(conversationId);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async (messageContent) => {
    if (!messageContent.trim()) return;

    // Add user message to UI immediately
    const userMessage = {
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let currentConversationId = selectedConversationId;

      // Create new conversation if needed
      if (!currentConversationId) {
        const response = await apiService.startConversation(user.id, messageContent);
        currentConversationId = response.conversation_id;
        setSelectedConversationId(currentConversationId);
        
        // Reload conversations to show the new one
        await loadConversations();
      }

      // Send message to backend and handle streaming response
      const response = await apiService.sendMessage(currentConversationId, messageContent);
      
      if (response.ok) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';

        // Add empty assistant message that will be updated
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString()
        }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          assistantMessage += chunk;
          
          // Update the assistant message in real-time
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              lastMessage.content = assistantMessage;
            }
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: 'متاسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setMessages([]);
    setConversations([]);
    setSelectedConversationId(null);
  };

  const handleSendFeedback = async (messageId, rating) => {
    try {
      if (user && user.id) {
        await apiService.sendFeedback(messageId, user.id, rating);
        console.log(`Feedback sent for message ${messageId} with rating ${rating}`);
        // Optionally, update UI to show feedback was sent
      } else {
        console.warn("User not logged in, cannot send feedback.");
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 rtl">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 right-4 z-30 lg:hidden bg-white shadow-md"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sidebar
        conversations={conversations}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        selectedConversationId={selectedConversationId}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        user={user}
        onLogout={handleLogout}
      />
      <ChatArea
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        setIsMobileOpen={setIsMobileOpen}
        user={user}
        onSendFeedback={handleSendFeedback}
      />
    </div>
  );
}

export default App;

