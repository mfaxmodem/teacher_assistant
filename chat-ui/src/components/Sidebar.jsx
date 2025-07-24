import React, { useState } from 'react';
import { Plus, MessageSquare, Library, Bot, Settings, Menu, X, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { Button } from './ui/button';

const Sidebar = ({ conversations = [], onNewChat, onSelectConversation, selectedConversationId, isMobileOpen, setIsMobileOpen, user, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const sampleConversations = [
    { id: '1', title: 'test' },
    { id: '2', title: 'test' },
    { id: '3', title: 'test' }
  ];

  const displayConversations = conversations.length > 0 ? conversations : sampleConversations;

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 right-0 z-50 bg-gray-50 border-l border-gray-200 
        transform transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-16' : 'w-64'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && <h2 className="text-lg font-semibold text-gray-900">گفتگوها</h2>}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button
            onClick={onNewChat}
            className={`w-full justify-start gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 ${
              isCollapsed ? 'px-3 justify-center' : ''
            }`}
            variant="outline"
            title={isCollapsed ? 'گفتگوی جدید' : ''}
          >
            <MessageSquare className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && 'گفتگوی جدید'}
          </Button>
        </div>

        {/* Navigation */}
        {!isCollapsed && (
          <div className="px-4 pb-4">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start gap-2 text-gray-600">
                <Library className="h-4 w-4" />
                کتابخانه
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 text-gray-600">
                <Bot className="h-4 w-4" />
                سایر
              </Button>
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-4">
          {!isCollapsed && (
            <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
              چت‌ها
            </div>
          )}
          <div className="space-y-1">
            {displayConversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant="ghost"
                className={`w-full justify-start text-right p-2 h-auto min-h-[2.5rem] text-sm ${
                  selectedConversationId === conversation.id 
                    ? 'bg-gray-200 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-100'
                } ${isCollapsed ? 'px-3 justify-center' : ''}`}
                onClick={() => onSelectConversation(conversation.id)}
                title={isCollapsed ? conversation.title : ''}
              >
                <MessageSquare className="h-4 w-4 ml-2 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="truncate text-right flex-1">{conversation.title}</span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {user?.mobile ? user.mobile.charAt(0) : 'ک'}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1">
                  <div className="text-sm text-gray-700">{user?.mobile || 'کاربر'}</div>
                  <div className="text-xs text-gray-500">{user?.technicalField || 'نسخه 1'}</div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 p-1"
                    title="تنظیمات"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.confirm('آیا می‌خواهید خارج شوید؟') && onLogout?.()}
                    className="text-gray-500 hover:text-red-600 p-1"
                    title="خروج"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
            {isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.confirm('آیا می‌خواهید خارج شوید؟') && onLogout?.()}
                className="text-gray-500 hover:text-red-600 p-1 absolute bottom-4 right-4"
                title="خروج"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

