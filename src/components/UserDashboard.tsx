import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { BookingModal } from "./BookingModal";
import { EditProperty } from "./EditProperty";
import { RatableBookings } from "./RatableBookings";
import { OwnerRatingDisplay } from "./OwnerRatingDisplay";
import { PropertyRatingDisplay } from "./PropertyRatingDisplay";

export function UserDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'bookings' | 'ratings'>('overview');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBookingProperty, setSelectedBookingProperty] = useState<any>(null);

  const user = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.userProfiles.getProfileByUserId, user?._id ? { userId: user._id } : "skip");
  const userProperties = useQuery(api.properties.getUserProperties);
  const userBookings = useQuery(api.bookings.getUserBookings);
  const notifications = useQuery(api.notifications.getNotifications);

  // Delete property function temporarily disabled
  // const deleteProperty = useMutation(api.properties.deleteProperty);

  const handleDeleteProperty = async (propertyId: any) => {
    // Delete property temporarily disabled
    toast.error("حذف العقارات غير متوفر حالياً");
    // if (confirm("هل أنت متأكد من حذف هذا العقار؟")) {
    //   try {
    //     await deleteProperty({ propertyId });
    //     toast.success("تم حذف العقار بنجاح");
    //   } catch (error: any) {
    //     toast.error(error.message || "حدث خطأ أثناء حذف العقار");
    //   }
    // }
  };

  const handleEditProperty = (property: any) => {
    setSelectedProperty(property);
    setShowEditModal(true);
  };

  const handleBookProperty = (property: any) => {
    setSelectedBookingProperty(property);
    setShowBookingModal(true);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'قيد المراجعة',
      approved: 'مقبول',
      rejected: 'مرفوض',
      suspended: 'معلق',
      confirmed: 'مؤكد',
      cancelled: 'ملغي',
      completed: 'مكتمل',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels = {
      chalet: "شاليه",
      villa: "فيلا", 
      apartment: "شقة",
      resort: "منتجع"
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatDate = (dateInput: string | number) => {
    return new Date(dateInput).toLocaleDateString('ar-SA');
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + ' ريال';
  };

  const getCapacityInfo = (capacity: any) => {
    if (typeof capacity === 'number') {
      return { guests: capacity, bedrooms: 1, bathrooms: 1 };
    }
    return capacity;
  };

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: '📊' },
    { id: 'properties', label: 'عقاراتي', icon: '🏠', count: userProperties?.length },
    { id: 'bookings', label: 'حجوزاتي', icon: '📅', count: userBookings?.length },
    { id: 'ratings', label: 'تقييماتي', icon: '⭐' },
  ];

  if (!user) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">
              مرحباً، {user.name || 'مستخدم'}
            </h1>
            <p className="text-gray-600">{user.email}</p>
            {/* Rating temporarily disabled */}
          </div>
          {user.isAnonymous && (
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              ضيف
            </div>
          )}
        </div>
      </div>

      {/* Ratable Bookings Alert */}
      <RatableBookings />

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'bg-amber-50 text-amber-600 border-b-2 border-amber-500'
                    : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {tab.count && tab.count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">نظرة عامة</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">عقاراتي</p>
                      <p className="text-2xl font-bold text-blue-800">{userProperties?.length || 0}</p>
                    </div>
                    <div className="text-3xl">🏠</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">حجوزاتي</p>
                      <p className="text-2xl font-bold text-green-800">{userBookings?.length || 0}</p>
                    </div>
                    <div className="text-3xl">📅</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">تقييمي</p>
                      <p className="text-2xl font-bold text-purple-800">
                        {'لا يوجد'}
                      </p>
                    </div>
                    <div className="text-3xl">⭐</div>
                  </div>
                </div>
              </div>

              {/* Recent Notifications */}
              {notifications && notifications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">آخر الإشعارات</h3>
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((notification) => (
                      <div key={notification._id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{notification.title}</h4>
                            <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(notification._creationTime)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  عقاراتي ({userProperties?.length || 0})
                </h2>
              </div>

              {userProperties === undefined ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">جاري التحميل...</p>
                </div>
              ) : userProperties.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    لا توجد عقارات
                  </h3>
                  <p className="text-gray-500 mb-4">
                    ابدأ بإضافة عقارك الأول
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userProperties.map((property) => (
                    <div key={property._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Property Image */}
                      <div className="h-48 overflow-hidden">
                        {property.imageUrls && property.imageUrls.length > 0 ? (
                          <img
                            src={property.imageUrls[0] || ""}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                            <span className="text-4xl">🏖️</span>
                          </div>
                        )}
                      </div>

                      {/* Property Details */}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                            {property.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status || "pending")}`}>
                            {getStatusLabel(property.status || "pending")}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          📍 {property.location.district}, {property.location.city}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span>🏠 {getPropertyTypeLabel(property.propertyType)}</span>
                          <span>💰 {formatPrice(property.price)}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span>🛏️ {getCapacityInfo(property.capacity).bedrooms} غرف</span>
                          <span>🚿 {getCapacityInfo(property.capacity).bathrooms} حمام</span>
                          <span>👥 {getCapacityInfo(property.capacity).guests} أشخاص</span>
                        </div>

                        {(property as any).rejectionReason && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                            <p className="text-red-800 text-sm">
                              <strong>سبب الرفض:</strong> {(property as any).rejectionReason}
                            </p>
                          </div>
                        )}

                        {(property as any).suspensionReason && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                            <p className="text-orange-800 text-sm">
                              <strong>سبب الإيقاف:</strong> {(property as any).suspensionReason}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProperty(property)}
                            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(property._id)}
                            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">
                حجوزاتي ({userBookings?.length || 0})
              </h2>

              {userBookings === undefined ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">جاري التحميل...</p>
                </div>
              ) : userBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    لا توجد حجوزات
                  </h3>
                  <p className="text-gray-500">
                    ابحث عن عقار واحجز إجازتك القادمة
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userBookings.map((booking) => (
                    <div key={booking._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex gap-6">
                        {/* Property Image */}
                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          {booking.property?.imageUrls && booking.property.imageUrls.length > 0 ? (
                            <img
                              src={booking.property.imageUrls[0] || ""}
                              alt={booking.property.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                              <span className="text-2xl">🏖️</span>
                            </div>
                          )}
                        </div>

                        {/* Booking Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {booking.property?.title}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                              {getStatusLabel(booking.status)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">📅 تاريخ الوصول:</span>
                              <br />
                              {formatDate(booking.checkInDate)}
                            </div>
                            <div>
                              <span className="font-medium">📅 تاريخ المغادرة:</span>
                              <br />
                              {formatDate(booking.checkOutDate)}
                            </div>
                            <div>
                              <span className="font-medium">💰 المبلغ الإجمالي:</span>
                              <br />
                              <span className="text-green-600 font-semibold">{formatPrice(booking.totalPrice)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>👥 {booking.numberOfGuests} أشخاص</span>
                            <span>📍 {booking.property?.location.district}, {booking.property?.location.city}</span>
                          </div>

                          {booking.specialRequests && (
                            <div className="mt-3 bg-blue-50 rounded-lg p-3">
                              <p className="text-blue-800 text-sm">
                                <strong>طلبات خاصة:</strong> {booking.specialRequests}
                              </p>
                            </div>
                          )}

                          {booking.cancellationReason && (
                            <div className="mt-3 bg-red-50 rounded-lg p-3">
                              <p className="text-red-800 text-sm">
                                <strong>سبب الإلغاء:</strong> {booking.cancellationReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ratings Tab */}
          {activeTab === 'ratings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">التقييمات</h2>
              
              {/* Owner Ratings */}
              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">تقييماتي كمالك</h3>
                {user && (
                  <OwnerRatingDisplay ownerId={user._id} />
                )}
              </div>

              {/* Property Reviews Summary */}
              {userProperties && userProperties.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">تقييمات عقاراتي</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProperties.slice(0, 4).map((property) => (
                      <div key={property._id} className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="font-medium text-gray-800 mb-2 truncate">{property.title}</h4>
                        <PropertyRatingDisplay propertyId={property._id} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Property Modal */}
      {showEditModal && selectedProperty && (
        <EditProperty
          propertyId={selectedProperty._id}
          onBack={() => {
            setShowEditModal(false);
            setSelectedProperty(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedProperty(null);
          }}
        />
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedBookingProperty && (
        <BookingModal
          propertyId={selectedBookingProperty._id}
          property={selectedBookingProperty}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedBookingProperty(null);
          }}
          onSuccess={() => {
            setShowBookingModal(false);
            setSelectedBookingProperty(null);
          }}
        />
      )}
    </div>
  );
}
