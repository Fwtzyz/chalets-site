import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { DateRangePicker } from "./DateRangePicker";

interface EnhancedBookingModalProps {
  propertyId: any;
  property: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function EnhancedBookingModal({ propertyId, property, onClose, onSuccess }: EnhancedBookingModalProps) {
  const [formData, setFormData] = useState({
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: 1,
    specialRequests: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const user = useQuery(api.auth.loggedInUser);
  const createBooking = useMutation(api.bookings.createBooking);
  
  // Get unavailable dates - simplified for now
  const getUnavailableDates = () => {
    // For now, return empty array. In future, we can implement proper availability checking
    return [];
  };

  const calculatePrice = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;

    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (nights <= 0) return 0;

    // Handle different capacity formats
    let pricePerNight = property.price;
    if (property.priceType) {
      switch (property.priceType) {
        case "per_night":
          return pricePerNight * nights;
        case "per_week":
          const weeks = Math.ceil(nights / 7);
          return pricePerNight * weeks;
        case "per_month":
          const months = Math.ceil(nights / 30);
          return pricePerNight * months;
        default:
          return pricePerNight * nights;
      }
    }

    return pricePerNight * nights;
  };

  const calculateNights = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getPropertyCapacity = () => {
    if (typeof property.capacity === 'number') {
      return property.capacity;
    }
    return property.capacity?.guests || 4;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is anonymous (guest)
    if (user?.isAnonymous) {
      toast.error("المستخدمون الضيوف لا يمكنهم إجراء حجوزات. يرجى إنشاء حساب أولاً");
      return;
    }
    
    if (!formData.checkInDate || !formData.checkOutDate) {
      toast.error("يرجى تحديد تواريخ الوصول والمغادرة");
      return;
    }

    const propertyCapacity = getPropertyCapacity();
    if (formData.numberOfGuests > propertyCapacity) {
      toast.error(`عدد الضيوف لا يمكن أن يتجاوز ${propertyCapacity}`);
      return;
    }

    // Basic date validation
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    
    if (checkIn >= checkOut) {
      toast.error("تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول");
      return;
    }

    setIsLoading(true);

    try {
      await createBooking({
        propertyId,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guests: formData.numberOfGuests,
        totalPrice: totalPrice,
        specialRequests: formData.specialRequests || undefined,
      });

      toast.success("تم إرسال طلب الحجز بنجاح! سيتم إشعارك عند تأكيد المالك.");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "فشل في إرسال طلب الحجز");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalPrice = calculatePrice();
  const nights = calculateNights();
  const propertyCapacity = getPropertyCapacity();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">حجز العقار</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Property Info */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-gray-800 mb-2">{property.title}</h4>
          <p className="text-sm text-gray-600">
            📍 {property.location.district}, {property.location.city}
          </p>
          <p className="text-sm text-gray-600">
            👥 يستوعب حتى {propertyCapacity} أشخاص
          </p>
          <p className="text-sm text-gray-600">
            💰 {property.price.toLocaleString()} ريال/ليلة
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Range Picker */}
          <DateRangePicker
            checkInDate={formData.checkInDate}
            checkOutDate={formData.checkOutDate}
            onCheckInChange={(date) => handleInputChange("checkInDate", date)}
            onCheckOutChange={(date) => handleInputChange("checkOutDate", date)}
            unavailableDates={getUnavailableDates()}
          />

          {/* Number of Guests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عدد الضيوف *
            </label>
            <select
              required
              value={formData.numberOfGuests}
              onChange={(e) => handleInputChange("numberOfGuests", Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[...Array(propertyCapacity)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i + 1 === 1 ? "شخص" : "أشخاص"}
                </option>
              ))}
            </select>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              طلبات خاصة (اختياري)
            </label>
            <textarea
              rows={3}
              value={formData.specialRequests}
              onChange={(e) => handleInputChange("specialRequests", e.target.value)}
              placeholder="أي طلبات خاصة مثل: وصول متأخر، ترتيبات خاصة، إلخ..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Price Summary */}
          {totalPrice > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-2">ملخص التكلفة</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>عدد الليالي:</span>
                  <span>{nights} ليلة</span>
                </div>
                <div className="flex justify-between">
                  <span>السعر لكل ليلة:</span>
                  <span>{property.price.toLocaleString()} ريال</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>المجموع:</span>
                    <span>{totalPrice.toLocaleString()} ريال</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guest Warning */}
          {user?.isAnonymous && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <span className="text-lg">⚠️</span>
                <span className="font-medium">تنبيه للضيوف</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                المستخدمون الضيوف لا يمكنهم إجراء حجوزات. يرجى إنشاء حساب أولاً للمتابعة.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.checkInDate || !formData.checkOutDate || user?.isAnonymous}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {user?.isAnonymous ? "يجب إنشاء حساب أولاً" : isLoading ? "جاري الإرسال..." : "تأكيد الحجز"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-xs text-gray-500">
          * سيتم إرسال طلب الحجز للمالك للمراجعة والتأكيد
        </div>
      </div>
    </div>
  );
}
