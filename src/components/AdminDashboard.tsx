import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'stats' | 'pending' | 'properties' | 'users'>('stats');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  
  // استخدام الـ API الجديد
  const adminStats = useQuery(api.admin.getAdminStats);
  const pendingProperties = useQuery(api.admin.getPendingProperties);
  const allProperties = useQuery(api.admin.getAllProperties);
  const user = useQuery(api.auth.loggedInUser);

  // Mutations
  const approveProperty = useMutation(api.admin.approveProperty);
  const rejectProperty = useMutation(api.admin.rejectProperty);
  const suspendProperty = useMutation(api.admin.suspendProperty);

  const tabs = [
    { id: 'stats', label: 'الإحصائيات', icon: '📊' },
    { id: 'pending', label: 'المراجعة', icon: '⏳', count: adminStats?.pendingProperties },
    { id: 'properties', label: 'العقارات', icon: '🏠', count: adminStats?.totalProperties },
    { id: 'users', label: 'المستخدمين', icon: '👥' },
  ];

  const getPropertyTypeLabel = (type: string) => {
    const labels = {
      chalet: "شاليه",
      villa: "فيلا", 
      apartment: "شقة",
      resort: "منتجع"
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + ' ريال';
  };

  const handleApprove = async (propertyId: Id<"properties">) => {
    try {
      await approveProperty({ propertyId });
      toast.success("تم قبول العقار بنجاح!");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء قبول العقار");
    }
  };

  const handleReject = async () => {
    if (!selectedProperty || !rejectReason.trim()) {
      toast.error("يرجى كتابة سبب الرفض");
      return;
    }

    try {
      await rejectProperty({ 
        propertyId: selectedProperty._id, 
        reason: rejectReason.trim() 
      });
      toast.success("تم رفض العقار بنجاح!");
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedProperty(null);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء رفض العقار");
    }
  };

  const handleSuspend = async () => {
    if (!selectedProperty || !suspendReason.trim()) {
      toast.error("يرجى كتابة سبب التعليق");
      return;
    }

    try {
      await suspendProperty({ 
        propertyId: selectedProperty._id, 
        reason: suspendReason.trim() 
      });
      toast.success("تم تعليق العقار بنجاح!");
      setShowSuspendModal(false);
      setSuspendReason("");
      setSelectedProperty(null);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تعليق العقار");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          لوحة تحكم الإدارة
        </h1>
        <p className="text-gray-600">
          إدارة العقارات والمستخدمين
        </p>
      </div>

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
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">إحصائيات الموقع</h2>
              
              {adminStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium">إجمالي العقارات</p>
                        <p className="text-2xl font-bold text-blue-800">{adminStats.totalProperties}</p>
                      </div>
                      <div className="text-3xl">🏠</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-600 text-sm font-medium">بانتظار المراجعة</p>
                        <p className="text-2xl font-bold text-yellow-800">{adminStats.pendingProperties}</p>
                      </div>
                      <div className="text-3xl">⏳</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">العقارات المقبولة</p>
                        <p className="text-2xl font-bold text-green-800">{adminStats.approvedProperties}</p>
                      </div>
                      <div className="text-3xl">✅</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-sm font-medium">إجمالي المستخدمين</p>
                        <p className="text-2xl font-bold text-purple-800">{adminStats.totalUsers}</p>
                      </div>
                      <div className="text-3xl">👥</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">جاري تحميل الإحصائيات...</p>
                </div>
              )}
            </div>
          )}

          {/* Pending Properties Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  العقارات بانتظار المراجعة ({pendingProperties?.length || 0})
                </h2>
                {pendingProperties && pendingProperties.length > 0 && (
                  <button
                    onClick={async () => {
                      for (const property of pendingProperties) {
                        await handleApprove(property._id);
                      }
                      toast.success(`تم قبول ${pendingProperties.length} عقار!`);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    ✅ قبول الكل
                  </button>
                )}
              </div>

              {pendingProperties === undefined ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">جاري التحميل...</p>
                </div>
              ) : pendingProperties.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    لا توجد عقارات بانتظار المراجعة
                  </h3>
                  <p className="text-gray-500">جميع العقارات تمت مراجعتها</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingProperties.map((property) => (
                    <div key={property._id} className="border border-yellow-200 rounded-lg p-6 bg-yellow-50">
                      <div className="flex gap-6">
                        {/* Property Image */}
                        <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                          {property.imageUrls && property.imageUrls.length > 0 ? (
                            <img
                              src={property.imageUrls[0] || ""}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                              <span className="text-3xl">🏖️</span>
                            </div>
                          )}
                        </div>

                        {/* Property Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                {property.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>📍 {property.location.district}, {property.location.city}</span>
                                <span>🏠 {getPropertyTypeLabel(property.propertyType)}</span>
                                <span>💰 {formatPrice(property.price)}</span>
                              </div>
                            </div>
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                              بانتظار المراجعة
                            </span>
                          </div>

                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {property.description}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                            <span>🛏️ {typeof property.capacity === 'object' ? property.capacity.bedrooms : 1} غرف</span>
                            <span>🚿 {typeof property.capacity === 'object' ? property.capacity.bathrooms : 1} حمام</span>
                            <span>👥 {typeof property.capacity === 'object' ? property.capacity.guests : property.capacity} أشخاص</span>
                          </div>

                          {/* Owner Info */}
                          <div className="bg-white rounded-lg p-3 mb-4">
                            <h4 className="font-medium text-gray-800 mb-2">معلومات المالك:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <span>👤 {property.owner.name}</span>
                              <span>📧 {property.owner.email}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleApprove(property._id)}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                            >
                              ✅ قبول
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProperty(property);
                                setShowRejectModal(true);
                              }}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                            >
                              ❌ رفض
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProperty(property);
                                setShowSuspendModal(true);
                              }}
                              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                            >
                              ⏸️ تعليق
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">
                جميع العقارات ({allProperties?.length || 0})
              </h2>

              {allProperties === undefined ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">جاري التحميل...</p>
                </div>
              ) : allProperties.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    لا توجد عقارات
                  </h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {allProperties.map((property) => (
                    <div key={property._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex gap-6">
                        {/* Property Image */}
                        <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                          {property.imageUrls && property.imageUrls.length > 0 ? (
                            <img
                              src={property.imageUrls[0] || ""}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                              <span className="text-3xl">🏖️</span>
                            </div>
                          )}
                        </div>

                        {/* Property Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                {property.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>📍 {property.location.district}, {property.location.city}</span>
                                <span>🏠 {getPropertyTypeLabel(property.propertyType)}</span>
                                <span>💰 {formatPrice(property.price)}</span>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              property.status === 'approved' ? 'bg-green-100 text-green-800' :
                              property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              property.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              property.status === 'suspended' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {property.status === 'approved' ? 'مقبول' :
                               property.status === 'pending' ? 'قيد المراجعة' : 
                               property.status === 'rejected' ? 'مرفوض' :
                               property.status === 'suspended' ? 'معلق' : 'غير محدد'}
                            </span>
                          </div>

                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {property.description}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                            <span>🛏️ {typeof property.capacity === 'object' ? property.capacity.bedrooms : 1} غرف</span>
                            <span>🚿 {typeof property.capacity === 'object' ? property.capacity.bathrooms : 1} حمام</span>
                            <span>👥 {typeof property.capacity === 'object' ? property.capacity.guests : property.capacity} أشخاص</span>
                          </div>

                          {/* Owner Info */}
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <h4 className="font-medium text-gray-800 mb-2">معلومات المالك:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <span>👤 {property.owner.name}</span>
                              <span>📧 {property.owner.email}</span>
                            </div>
                          </div>

                          {/* Action Buttons for non-approved properties */}
                          {property.status !== 'approved' && (
                            <div className="flex gap-3">
                              {property.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(property._id)}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                                  >
                                    ✅ قبول
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedProperty(property);
                                      setShowRejectModal(true);
                                    }}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                                  >
                                    ❌ رفض
                                  </button>
                                </>
                              )}
                              {property.status !== 'suspended' && property.status !== 'rejected' && (
                                <button
                                  onClick={() => {
                                    setSelectedProperty(property);
                                    setShowSuspendModal(true);
                                  }}
                                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                                >
                                  ⏸️ تعليق
                                </button>
                              )}
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

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">
                معلومات المستخدم الحالي
              </h2>

              {user ? (
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{user.name || 'مستخدم'}</h3>
                      <p className="text-gray-600">📧 {user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          مدير
                        </span>
                        {user.isAnonymous && (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            ضيف
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      انضم: {new Date(user._creationTime).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    لا توجد معلومات مستخدم
                  </h3>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">رفض العقار</h2>
            <p className="text-gray-600 mb-4">يرجى كتابة سبب رفض العقار:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="اكتب سبب الرفض..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
              >
                رفض العقار
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setSelectedProperty(null);
                }}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">تعليق العقار</h2>
            <p className="text-gray-600 mb-4">يرجى كتابة سبب تعليق العقار:</p>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="اكتب سبب التعليق..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={handleSuspend}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
              >
                تعليق العقار
              </button>
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSuspendReason("");
                  setSelectedProperty(null);
                }}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
