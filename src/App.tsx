import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { ArabicSignInForm } from "./components/ArabicSignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster, toast } from "sonner";
import { useState } from "react";
import { EnhancedHero } from "./components/EnhancedHero";
import { FeaturesSection } from "./components/FeaturesSection";
import { HomePropertiesSection } from "./components/HomePropertiesSection";
import { ImageUpload } from "./components/ImageUpload";
import { Id } from "../convex/_generated/dataModel";

// Main App
export default function App() {
  return (
    <div className="app-background" dir="rtl">
      <Authenticated>
        <AuthenticatedApp />
      </Authenticated>
      <Unauthenticated>
        <LoginScreen />
      </Unauthenticated>
    </div>
  );
}

function AuthenticatedApp() {
  const [currentView, setCurrentView] = useState<"home" | "properties" | "bookings" | "admin">("home");
  
  // Check admin status
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.userProfiles.getProfileByUserId, loggedInUser?._id ? { userId: loggedInUser._id } : "skip");
  const isAdmin = userProfile?.isAdmin || false;
  const makeAdmin = useMutation(api.userProfiles.makeCurrentUserAdmin);

  // Main content switcher
  let mainContent = null;
  
  if (currentView === "home") {
    mainContent = (
      <>
        <EnhancedHero onSearch={(searchTerm) => console.log("Search:", searchTerm)} />
        <HomePropertiesSection />
        <FeaturesSection />
      </>
    );
  } else if (currentView === "properties") {
    mainContent = <SimplePropertiesView />;
  } else if (currentView === "bookings") {
    mainContent = <BookingsView />;
  } else if (currentView === "admin" && isAdmin) {
    mainContent = <SimpleAdminView />;
  }

  return (
    <>
      {/* Floating particles */}
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <div className="content-wrapper min-h-screen flex flex-col">
        {/* Simple Navigation */}
        <nav className="bg-white shadow-lg border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <h1 className="text-2xl font-bold text-blue-600">🏖️ شاليهات السعودية</h1>
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentView("home")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentView === "home" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    🏠 الرئيسية
                  </button>
                  <button
                    onClick={() => setCurrentView("properties")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentView === "properties" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    📋 العقارات
                  </button>
                  <button
                    onClick={() => setCurrentView("bookings")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentView === "bookings" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    📅 حجوزاتي
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setCurrentView("admin")}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentView === "admin" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      ⚙️ الإدارة
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {!isAdmin && (
                  <button
                    onClick={() => makeAdmin()}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm"
                  >
                    🔑 أصبح مديراً
                  </button>
                )}
                <div className="text-sm text-gray-600">
                  مرحباً، {userProfile?.fullName || loggedInUser?.name || "المستخدم"}
                </div>
                <SignOutButton />
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1">
          {mainContent}
        </main>
      </div>
      <Toaster />
    </>
  );
}

function BookingsView() {
  const userBookings = useQuery(api.bookings.getUserBookings);
  const cancelBooking = useMutation(api.bookings.cancelBooking);

  const handleCancelBooking = async (bookingId: Id<"bookings">) => {
    try {
      await cancelBooking({ bookingId });
      toast.success("تم إلغاء الحجز بنجاح");
    } catch (error) {
      toast.error("فشل في إلغاء الحجز");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed": return "مؤكد";
      case "pending": return "قيد المراجعة";
      case "cancelled": return "ملغي";
      case "completed": return "مكتمل";
      default: return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">حجوزاتي</h2>
        <p className="text-gray-600">إدارة جميع حجوزاتك في مكان واحد</p>
      </div>

      {!userBookings || userBookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد حجوزات</h3>
          <p className="text-gray-500 mb-6">لم تقم بأي حجوزات بعد</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            تصفح الشاليهات
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {userBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      حجز رقم: {booking._id.slice(-6)}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>تاريخ الوصول: {booking.checkInDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>تاريخ المغادرة: {booking.checkOutDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>👥</span>
                        <span>عدد الضيوف: {booking.guests || booking.numberOfGuests || 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>💰</span>
                        <span>المبلغ الإجمالي: {booking.totalPrice.toLocaleString()} ريال</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                    
                    {booking.status === "pending" && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        إلغاء الحجز
                      </button>
                    )}
                  </div>
                </div>

                {booking.specialRequests && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">الطلبات الخاصة:</h4>
                    <p className="text-gray-600 text-sm">{booking.specialRequests}</p>
                  </div>
                )}

                {booking.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">ملاحظات:</h4>
                    <p className="text-gray-600 text-sm">{booking.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SimplePropertiesView() {
  const properties = useQuery(api.properties.getProperties);
  const [showAddForm, setShowAddForm] = useState(false);

  if (showAddForm) {
    return <SimpleAddPropertyForm onClose={() => setShowAddForm(false)} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">إدارة الشاليهات</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          + إضافة شاليه جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties?.map((property) => (
          <div key={property._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="relative h-48">
              {property.imageUrls && property.imageUrls.length > 0 ? (
                <img
                  src={property.imageUrls[0] || ""}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
                  <span className="text-4xl">🏖️</span>
                </div>
              )}
              
              <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-xs font-medium">
                {property.propertyType === "chalet" ? "شاليه" : 
                 property.propertyType === "villa" ? "فيلا" :
                 property.propertyType === "apartment" ? "شقة" : "منتجع"}
              </div>
              
              <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                {property.price.toLocaleString()} ريال/ليلة
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{property.title}</h3>
              <div className="text-gray-600 text-sm mb-2">
                📍 {property.location.district}, {property.location.city}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    property.status === "approved" ? "bg-green-100 text-green-800" :
                    property.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {property.status === "approved" ? "معتمد" :
                     property.status === "pending" ? "قيد المراجعة" : "مرفوض"}
                  </span>
                </div>
                
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                  عرض التفاصيل
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleAdminView() {
  const [activeTab, setActiveTab] = useState<"properties" | "bookings">("properties");
  const pendingProperties = useQuery(api.admin.getPendingProperties);
  const adminStats = useQuery(api.admin.getAdminStats);
  const approveProperty = useMutation(api.admin.approveProperty);
  const rejectProperty = useMutation(api.admin.rejectProperty);
  
  // Get all bookings for admin
  const allBookings = useQuery(api.bookings.getUserBookings);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">لوحة إدارة شاليهات السعودية</h2>

      {/* Stats */}
      {adminStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">إجمالي الشاليهات</h3>
            <p className="text-3xl font-bold text-blue-600">{adminStats.properties.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">قيد المراجعة</h3>
            <p className="text-3xl font-bold text-yellow-600">{adminStats.properties.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">معتمد</h3>
            <p className="text-3xl font-bold text-green-600">{adminStats.properties.approved}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">إجمالي الحجوزات</h3>
            <p className="text-3xl font-bold text-purple-600">{adminStats.bookings.total}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("properties")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "properties" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            الشاليهات المعلقة
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "bookings" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            إدارة الحجوزات
          </button>
        </div>
      </div>

      {/* Pending Properties */}
      {activeTab === "properties" && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">الشاليهات المعلقة</h3>
        
        <div className="space-y-4">
          {pendingProperties?.map((property) => (
            <div key={property._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">{property.title}</h4>
                  <p className="text-gray-600 mb-2">{property.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📍 {property.location.city}, {property.location.district}</span>
                    <span>💰 {property.price.toLocaleString()} ريال/ليلة</span>
                    <span>👤 {property.ownerName}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => approveProperty({ propertyId: property._id })}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    ✓ اعتماد
                  </button>
                  <button
                    onClick={() => rejectProperty({ propertyId: property._id })}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    ✗ رفض
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Bookings Management */}
      {activeTab === "bookings" && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">إدارة الحجوزات</h3>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-600">سيتم إضافة إدارة شاملة للحجوزات قريباً</p>
            <p className="text-sm text-gray-500 mt-2">
              ستتمكن من عرض وإدارة جميع الحجوزات في النظام
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function SimpleAddPropertyForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    district: "",
    propertyType: "chalet" as "chalet" | "villa" | "apartment" | "resort",
    guests: "",
    bedrooms: "",
    bathrooms: "",
    amenities: [] as string[],
  });
  
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addProperty = useMutation(api.properties.addProperty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.price) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);
    try {
      await addProperty({
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price),
        location: {
          city: formData.city,
          district: formData.district,
        },
        propertyType: formData.propertyType,
        capacity: {
          guests: parseInt(formData.guests),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
        },
        amenities: formData.amenities,
        images: [],
        imageUrls: imageUrls,
      });

      toast.success("تم إضافة الشاليه بنجاح! سيتم مراجعته من قبل الإدارة.");
      onClose();
    } catch (error) {
      console.error("Error creating property:", error);
      toast.error("فشل في إضافة الشاليه");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">إضافة شاليه جديد</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الشاليه *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="مثال: شاليه الواحة الذهبية"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وصف الشاليه *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="اكتب وصفاً مفصلاً عن الشاليه والمرافق المتوفرة..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر (ريال/ليلة) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع العقار *
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="chalet">شاليه</option>
                <option value="villa">فيلا</option>
                <option value="apartment">شقة</option>
                <option value="resort">منتجع</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المدينة *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="الرياض"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحي *
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="العليا"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد الضيوف *
              </label>
              <input
                type="number"
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="4"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد غرف النوم *
              </label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد دورات المياه *
              </label>
              <input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="2"
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <ImageUpload
              onImagesUploaded={setImageUrls}
              maxImages={5}
              existingImages={imageUrls}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
            >
              {isSubmitting ? "جاري الإضافة..." : "إضافة الشاليه"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoginScreen() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Floating Shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full animate-bounce delay-500"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 gap-4 h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="bg-gray-400 rounded-sm"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">🏖️ شاليهات السعودية</h1>
            <p className="text-gray-600">منصة حجز الشاليهات والاستراحات الأولى في المملكة</p>
          </div>
          <ArabicSignInForm />
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 text-4xl animate-bounce">🏖️</div>
      <div className="absolute top-20 right-20 text-3xl animate-pulse">🌊</div>
      <div className="absolute bottom-20 left-20 text-3xl animate-bounce delay-300">🏠</div>
      <div className="absolute bottom-10 right-10 text-4xl animate-pulse delay-700">⭐</div>
    </div>
  );
}
