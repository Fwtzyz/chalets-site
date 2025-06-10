import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface Message {
  _id: Id<"messages">;
  _creationTime: number;
  conversationId: Id<"conversations">;
  senderId: Id<"users">;
  content: string;
  messageType: "text" | "image" | "file" | "contact_request";
  attachmentId?: Id<"_storage">;
  status?: "sent" | "delivered" | "read";
  isRead?: boolean; // Legacy field
}

interface ChatWindowProps {
  conversationId: Id<"conversations">;
  otherParticipant: {
    _id?: Id<"users">;
    name: string;
    email?: string;
    profilePicture?: Id<"_storage">;
    isVerified: boolean;
  };
}

export function ChatWindow({ conversationId, otherParticipant }: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = useQuery(api.auth.loggedInUser);
  const messages = useQuery(api.messages.getMessages, { conversationId });
  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markMessagesAsRead);
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);
  const deleteMessage = useMutation(api.messages.deleteMessage);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    markAsRead({ conversationId });
  }, [conversationId, markAsRead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendMessage({
        conversationId,
        content: newMessage.trim(),
        messageType: "text",
      });
      setNewMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("فشل في رفع الملف");
      }

      const { storageId } = await result.json();
      const messageType = file.type.startsWith("image/") ? "image" : "file";

      await sendMessage({
        conversationId,
        content: file.name,
        messageType,
        attachmentId: storageId,
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMessage = async (messageId: Id<"messages">) => {
    try {
      await deleteMessage({ messageId });
    } catch (error: any) {
      console.error("Error deleting message:", error);
    }
  };

  if (!user || !messages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            {otherParticipant.profilePicture ? (
              <img
                src={`/api/storage/${otherParticipant.profilePicture}`}
                alt="صورة المستخدم"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-bold">
                {otherParticipant.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-800">
              {otherParticipant.name}
              {otherParticipant.isVerified && (
                <span className="text-green-500 mr-1">✅</span>
              )}
            </h3>
            <p className="text-sm text-gray-500">متصل</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.page.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            isOwn={message.senderId === user._id}
            onDelete={() => handleDeleteMessage(message._id)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50"
            title="إرفاق ملف"
          >
            📎
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="اكتب رسالتك..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isUploading}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isUploading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUploading ? "⏳" : "إرسال"}
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onDelete: () => void;
}

function MessageBubble({ message, isOwn, onDelete }: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);
  const attachmentUrl = useQuery(
    api.messages.getAttachmentUrl,
    message.attachmentId ? { storageId: message.attachmentId } : "skip"
  );

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
          isOwn
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-800"
        }`}
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        {/* Message Content */}
        {message.messageType === "text" && (
          <p className="text-sm">{message.content}</p>
        )}
        
        {message.messageType === "image" && attachmentUrl && (
          <div>
            <img
              src={attachmentUrl}
              alt="صورة"
              className="max-w-full rounded-lg mb-2"
            />
            <p className="text-xs opacity-75">{message.content}</p>
          </div>
        )}
        
        {message.messageType === "file" && (
          <div className="flex items-center gap-2">
            <span className="text-lg">📄</span>
            <div>
              <p className="text-sm font-medium">{message.content}</p>
              {attachmentUrl && (
                <a
                  href={attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline opacity-75 hover:opacity-100"
                >
                  تحميل الملف
                </a>
              )}
            </div>
          </div>
        )}

        {/* Time and Status */}
        <div className={`flex items-center justify-between mt-1 text-xs ${
          isOwn ? "text-blue-100" : "text-gray-500"
        }`}>
          <span>{formatTime(message._creationTime)}</span>
          {isOwn && (
            <span className="mr-2">
              {message.status === "read" && "✓✓"}
              {message.status === "delivered" && "✓"}
              {message.status === "sent" && "⏳"}
            </span>
          )}
        </div>

        {/* Delete Button */}
        {isOwn && showMenu && (
          <button
            onClick={onDelete}
            className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            title="حذف الرسالة"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
