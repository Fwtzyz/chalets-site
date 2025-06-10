import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface MessagesCenterProps {
  initialConversationId?: any;
}

export function MessagesCenter({ initialConversationId }: MessagesCenterProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<any>(initialConversationId || null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const user = useQuery(api.auth.loggedInUser);
  const conversations = useQuery(api.messages.getConversations);
  const messages = useQuery(
    api.messages.getMessages,
    selectedConversationId ? { conversationId: selectedConversationId } : "skip"
  );
  const unreadCount = useQuery(api.messages.getUnreadMessagesCount);

  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markMessagesAsRead);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;

    setIsLoading(true);
    try {
      await sendMessage({
        conversationId: selectedConversationId,
        content: newMessage.trim(),
        messageType: "text",
      });
      setNewMessage("");
    } catch (error: any) {
      toast.error(error.message || "فشل في إرسال الرسالة");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = async (conversationId: any) => {
    setSelectedConversationId(conversationId);
    try {
      await markAsRead({ conversationId });
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ar-SA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('ar-SA', { 
        weekday: 'short' 
      });
    } else {
      return date.toLocaleDateString('ar-SA', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (user?.isAnonymous) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">الرسائل غير متاحة للضيوف</h2>
          <p className="text-gray-600">يرجى إنشاء حساب للوصول إلى الرسائل</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-[600px]">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                💬 الرسائل
                {unreadCount && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations === undefined ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex gap-3 p-3">
                        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    لا توجد محادثات
                  </h3>
                  <p className="text-gray-500 text-sm">
                    ابدأ محادثة جديدة من خلال التواصل مع مالك عقار
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation._id}
                      onClick={() => handleSelectConversation(conversation._id)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversationId === conversation._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {conversation.otherParticipant.name?.charAt(0).toUpperCase() || '👤'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-gray-800 truncate">
                              {conversation.otherParticipant.name || 'مستخدم'}
                            </h4>
                            {conversation.lastMessage && (
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.lastMessage._creationTime)}
                              </span>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                          {conversation.unreadCount > 0 && (
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-gray-500">
                                {conversation.propertyId && "متعلق بعقار"}
                              </span>
                              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                {conversation.unreadCount}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversationId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  {conversations && (
                    (() => {
                      const conversation = conversations.find(c => c._id === selectedConversationId);
                      return conversation ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {conversation.otherParticipant.name?.charAt(0).toUpperCase() || '👤'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {conversation.otherParticipant.name || 'مستخدم'}
                            </h3>
                            {conversation.propertyId && (
                              <p className="text-xs text-gray-500">محادثة متعلقة بعقار</p>
                            )}
                          </div>
                        </div>
                      ) : null;
                    })()
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages === undefined ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                            <div className="max-w-xs">
                              <div className="h-4 bg-gray-300 rounded w-32 mb-1"></div>
                              <div className="h-8 bg-gray-300 rounded"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : messages.page.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">💬</div>
                      <p className="text-gray-500">لا توجد رسائل في هذه المحادثة</p>
                    </div>
                  ) : (
                    messages.page.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.senderId === user?._id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.senderId === user?._id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === user?._id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message._creationTime)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="اكتب رسالتك..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isLoading}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "إرسال"
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    اختر محادثة للبدء
                  </h3>
                  <p className="text-gray-500">
                    اختر محادثة من القائمة لعرض الرسائل
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
