import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface BookingsListProps {
  type: "guest" | "owner";
}

export function BookingsList({ type }: BookingsListProps) {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [ownerNotes, setOwnerNotes] = useState("");

  const bookings = useQuery(
    type === "guest" ? api.bookings.getUserBookings : api.bookings.getOwnerBookings
  );
  const confirmBooking = useMutation(api.bookings.confirmBooking);
  const cancelBooking = useMutation(api.bookings.cancelBooking);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'قيد المراجعة',
      confirmed: 'مؤكد',
      cancelled: 'ملغي',
      completed: 'مكتمل',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleConfirmBooking = async (bookingId: any) => {
    try {
      await confirmBooking({
        bookingId,
        ownerNotes: ownerNotes || undefined,
      });
      toast.success("تم تأكيد الحجز بنجاح!");
      setSelectedBooking(null);
      setOwnerNotes("");
    } catch (error: any) {
      toast.error(error.message || "فشل في تأكيد الحجز");
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancellationReason.trim()) {
      toast.error("يرجى إدخال سبب الإلغاء");
      return;
    }

    try {
      await cancelBooking({
        bookingId: selectedBooking._id,
        cancellationReason,
      });
      toast.success("تم إلغاء الحجز");
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancellationReason("");
    } catch (error: any) {
      toast.error(error.message || "فشل في إلغاء الحجز");
    }
  };

  if (bookings === undefined) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-300 rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          لا توجد حجوزات
        </h3>
        <p className="text-gray-500">
          {type === "guest" 
            ? "لم تقم بأي حجوزات بعد" 
            : "لا توجد حجوزات لعقاراتك"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex gap-4">
            {/* Property Image */}
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              {booking.property?.imageUrls && booking.property.imageUrls.length > 0 && booking.property.imageUrls[0] ? (
                <img
                  src={booking.property.imageUrls[0]}
                  alt={booking.property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <span className="text-2xl">🏖️</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {booking.property?.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    📍 {booking.property?.location.district}, {booking.property?.location.city}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                  {getStatusLabel(booking.status)}
                </span>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>تاريخ الوصول:</strong> {formatDate(booking.checkInDate)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>تاريخ المغادرة:</strong> {formatDate(booking.checkOutDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>عدد الضيوف:</strong> {booking.numberOfGuests}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>المبلغ الإجمالي:</strong> {booking.totalPrice.toLocaleString()} ريال
                  </p>
                </div>
              </div>

              {/* Other Party Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-gray-800">
                  {type === "guest" ? "معلومات المالك:" : "معلومات الضيف:"}
                </p>
                <p className="text-sm text-gray-600">
                  👤 {type === "guest" ? (booking as any).owner?.name : (booking as any).guest?.name}
                </p>
                <p className="text-sm text-gray-600">
                  📧 {type === "guest" ? (booking as any).owner?.email : (booking as any).guest?.email}
                </p>
              </div>

              {/* Notes */}
              {booking.guestNotes && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-800">ملاحظات الضيف:</p>
                  <p className="text-sm text-gray-600">{booking.guestNotes}</p>
                </div>
              )}

              {booking.ownerNotes && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-800">ملاحظات المالك:</p>
                  <p className="text-sm text-gray-600">{booking.ownerNotes}</p>
                </div>
              )}

              {booking.cancellationReason && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-red-800">سبب الإلغاء:</p>
                  <p className="text-sm text-red-600">{booking.cancellationReason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {type === "owner" && booking.status === "pending" && (
                  <>
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      تأكيد الحجز
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowCancelModal(true);
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      رفض الحجز
                    </button>
                  </>
                )}

                {booking.status !== "cancelled" && booking.status !== "completed" && (
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowCancelModal(true);
                    }}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
                  >
                    إلغاء الحجز
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Confirm Booking Modal */}
      {selectedBooking && !showCancelModal && type === "owner" && selectedBooking.status === "pending" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              تأكيد الحجز
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات للضيف (اختياري)
              </label>
              <textarea
                value={ownerNotes}
                onChange={(e) => setOwnerNotes(e.target.value)}
                placeholder="أي تعليمات أو ملاحظات للضيف..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setOwnerNotes("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleConfirmBooking(selectedBooking._id)}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                تأكيد الحجز
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              إلغاء الحجز
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سبب الإلغاء *
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="اكتب سبب إلغاء الحجز..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                  setCancellationReason("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={!cancellationReason.trim()}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إلغاء الحجز
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
