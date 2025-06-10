import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

import { Id } from "../../convex/_generated/dataModel";
interface PropertyDetailsProps {
  propertyId: Id<"properties">;
  onBack?: () => void;
  onNavigateToMessages?: (conversationId: string) => void;
}

export function PropertyDetails({
  propertyId,
  onBack,
  onNavigateToMessages,
}: PropertyDetailsProps) {
  const property = useQuery(api.properties.getPropertyById, { propertyId });
  const ownerProfile = useQuery(
    api.userProfiles.getProfileByUserId,
    property?.ownerId ? { userId: property.ownerId } : "skip"
  );
  const [startingChat, setStartingChat] = useState(false);
  const startConversation = useMutation(api.conversations.startConversation);

  if (property === undefined) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">جاري تحميل تفاصيل العقار...</p>
      </div>
    );
  }
  if (!property) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🏠</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          لم يتم العثور على العقار
        </h3>
        <button
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg"
          onClick={onBack}
        >
          العودة
        </button>
      </div>
    );
  }

  const handleContactOwner = async () => {
    setStartingChat(true);
    try {
      const conversationId = await startConversation({
        participantId: property.ownerId,
        propertyId: property._id,
      });
      toast.success("تم بدء المحادثة مع المالك!");
      if (onNavigateToMessages) {
        onNavigateToMessages(conversationId);
      }
    } catch (e) {
      toast.error("حدث خطأ أثناء بدء المحادثة");
    } finally {
      setStartingChat(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <button
        className="mb-4 text-blue-600 hover:underline"
        onClick={onBack}
      >
        ← العودة
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          {property.imageUrls && property.imageUrls.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {property.imageUrls.slice(0, 4).map((url, i) =>
                url ? (
                  <img
                    key={i}
                    src={url}
                    alt={`صورة ${i + 1}`}
                    className="rounded-lg object-cover w-full h-40"
                  />
                ) : null
              )}
            </div>
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center rounded-lg">
              <span className="text-4xl">🏖️</span>
            </div>
          )}
        </div>
        {/* Details */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{property.title}</h2>
          <div className="text-gray-600 mb-2">
            {property.location.district}, {property.location.city}
          </div>
          <div className="flex items-center gap-3 text-sm mb-2">
            <span>🛏️ {typeof property.capacity === 'object' ? property.capacity.bedrooms : 1} غرف</span>
            <span>🚿 {typeof property.capacity === 'object' ? property.capacity.bathrooms : 1} حمام</span>
            <span>👥 {typeof property.capacity === 'object' ? property.capacity.guests : property.capacity} أشخاص</span>
          </div>
          <div className="mb-2">
            <span className="font-bold text-blue-600 text-xl">
              {property.price.toLocaleString()} ريال
            </span>
            <span className="text-gray-500 ml-2">/ ليلة</span>
          </div>
          <div className="mb-4">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
              {property.propertyType === "chalet"
                ? "شاليه"
                : property.propertyType === "villa"
                ? "فيلا"
                : property.propertyType === "apartment"
                ? "شقة"
                : property.propertyType === "resort"
                ? "منتجع"
                : property.propertyType}
            </span>
            {property.status && (
              <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                {property.status === "pending"
                  ? "بانتظار الموافقة"
                  : property.status === "approved"
                  ? "معتمد"
                  : property.status === "rejected"
                  ? "مرفوض"
                  : property.status === "suspended"
                  ? "موقوف"
                  : property.status}
              </span>
            )}
          </div>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">الوصف:</h3>
            <p className="text-gray-600">{property.description}</p>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">المرافق:</h3>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((a: string, i: number) => (
                <span
                  key={i}
                  className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">معلومات المالك:</h3>
            {ownerProfile ? (
              <div className="flex items-center gap-2">
                {ownerProfile.profilePictureUrl && (
                  <img
                    src={ownerProfile.profilePictureUrl}
                    alt="صورة المالك"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <span className="font-medium text-gray-800">
                  {ownerProfile.firstName || ""} {ownerProfile.lastName || ""}
                </span>
              </div>
            ) : (
              <span className="text-gray-500">جاري التحميل...</span>
            )}
          </div>
          <button
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all mt-4"
            onClick={handleContactOwner}
            disabled={startingChat}
          >
            {startingChat ? "جاري بدء المحادثة..." : "تواصل مع المالك"}
          </button>
        </div>
      </div>
    </div>
  );
}
