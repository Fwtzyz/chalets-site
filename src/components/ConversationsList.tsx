import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ConversationsListProps {
  onSelectConversation: (conversationId: Id<"conversations">) => void;
  selectedConversation: Id<"conversations"> | null;
}

export function ConversationsList({ onSelectConversation, selectedConversation }: ConversationsListProps) {
  const conversations = useQuery(api.messages.getConversations);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString("ar-SA", { weekday: "short" });
    } else {
      return date.toLocaleDateString("ar-SA", {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (!conversations) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 text-sm mt-2">جاري التحميل...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-4xl mb-4">💬</div>
        <p className="text-gray-500">لا توجد محادثات بعد</p>
        <p className="text-sm text-gray-400 mt-2">
          ابدأ محادثة جديدة من صفحة العقار
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {conversations.map((conversation) => (
        <button
          key={conversation._id}
          onClick={() => onSelectConversation(conversation._id)}
          className={`w-full p-3 rounded-lg text-right transition-colors ${
            selectedConversation === conversation._id
              ? "bg-blue-100 border-blue-300"
              : "hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Profile Picture */}
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
              {conversation.otherParticipant.profilePicture ? (
                <img
                  src={`/api/storage/${conversation.otherParticipant.profilePicture}`}
                  alt="صورة المستخدم"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-lg font-bold">
                  {conversation.otherParticipant.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-gray-800 truncate">
                  {conversation.otherParticipant.name}
                  {conversation.otherParticipant.isVerified && (
                    <span className="text-green-500 mr-1">✅</span>
                  )}
                </h3>
                <span className="text-xs text-gray-500">
                  {conversation.lastMessage && formatTime(conversation.lastMessage._creationTime)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate">
                  {conversation.lastMessage?.content || "لا توجد رسائل"}
                </p>
                {conversation.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
