import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function EnhancedDashboard() {
  const user = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.userProfiles.getProfileByUserId, user?._id ? { userId: user._id } : "skip");
  const myProperties = useQuery(api.properties.getUserProperties);
  const myBookings = useQuery(api.bookings.getUserBookings);
  const recentNotifications = useQuery(api.notifications.getNotifications);

  const stats = {
    totalProperties: myProperties?.length || 0,
    activeProperties: myProperties?.filter((p: any) => p.isActive && p.status === 'approved').length || 0,
    totalBookings: myBookings?.length || 0,
    pendingBookings: myBookings?.filter((b: any) => b.status === 'pending').length || 0,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/20">
            {userProfile?.profilePictureUrl ? (
              <img
                src={userProfile.profilePictureUrl}
                alt="صورة الملف الشخصي"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : "👤"}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">
              مرحباً، {userProfile?.firstName || user?.name || "المستخدم"}!
            </h1>
            <p className="text-blue-100 text-lg">
              {userProfile?.isAdmin ? "👑 مدير النظام" : "مرحباً بك في منصة شاليهات السعودية"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">عقاراتي</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalProperties}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">العقارات النشطة</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeProperties}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">إجمالي الحجوزات</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalBookings}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">حجوزات معلقة</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingBookings}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Properties */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">عقاراتي الأخيرة</h2>
          {myProperties && myProperties.length > 0 ? (
            <div className="space-y-4">
              {myProperties.slice(0, 3).map((property: any) => (
                <div key={property._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-lg">
                    🏖️
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{property.title}</h3>
                    <p className="text-sm text-gray-600">{property.location.city}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    property.status === 'approved' ? 'bg-green-100 text-green-800' :
                    property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {property.status === 'approved' ? 'مقبول' :
                     property.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏠</div>
              <p className="text-gray-500">لم تقم بإضافة أي عقارات بعد</p>
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">الإشعارات الأخيرة</h2>
          {recentNotifications && recentNotifications.length > 0 ? (
            <div className="space-y-4">
              {recentNotifications.slice(0, 3).map((notification: any) => (
                <div key={notification._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                    📢
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 text-sm">{notification.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification._creationTime).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔔</div>
              <p className="text-gray-500">لا توجد إشعارات جديدة</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all">
            <div className="text-2xl mb-2">➕</div>
            <div className="font-medium">إضافة عقار جديد</div>
          </button>
          
          <button className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all">
            <div className="text-2xl mb-2">📋</div>
            <div className="font-medium">إدارة الحجوزات</div>
          </button>
          
          <button className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all">
            <div className="text-2xl mb-2">💬</div>
            <div className="font-medium">الرسائل</div>
          </button>
        </div>
      </div>
    </div>
  );
}
