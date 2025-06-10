interface PropertyRatingModalProps {
  propertyId: string;
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PropertyRatingModal({ propertyId, bookingId, isOpen, onClose }: PropertyRatingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">تقييم العقار</h2>
        <p className="text-gray-500 mb-4">نظام التقييم غير متوفر حالياً</p>
        <button
          onClick={onClose}
          className="w-full bg-gray-500 text-white py-2 rounded-lg"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
}
