import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: "home" | "dashboard" | "properties" | "add-property" | "edit-property" | "property-details" | "complaints" | "profile" | "my-properties" | "admin" | "messages") => void;
  onProfileClick: () => void;
}

export function EnhancedNavigation({ currentView, setCurrentView, onProfileClick }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.userProfiles.getProfileByUserId, user?._id ? { userId: user._id } : "skip");
  const isAdmin = useQuery(api.userProfiles.isCurrentUserAdmin);
  const unreadNotifications = useQuery(api.notifications.getUnreadCount);

  const navigationItems: Array<{
    id: "home" | "dashboard" | "properties" | "add-property" | "edit-property" | "property-details" | "complaints" | "profile" | "my-properties" | "admin" | "messages";
    label: string;
    icon: string;
    color: string;
  }> = [
    { id: 'home', label: 'الرئيسية', icon: '🏠', color: 'blue' },
    { id: 'properties', label: 'العقارات', icon: '🏢', color: 'green' },
    { id: 'messages', label: 'الرسائل', icon: '💬', color: 'orange' },
    { id: 'complaints', label: 'الشكاوى', icon: '📞', color: 'red' },
  ];

  if (isAdmin) {
    navigationItems.push({ id: 'admin', label: 'لوحة الإدارة', icon: '⚙️', color: 'purple' });
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
              🏖️
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                شاليهات السعودية
              </h1>
              <p className="text-xs text-gray-500">منصة الإيجار الرائدة</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`px-4 py-2 rounded-lg transition-all font-medium relative ${
                  currentView === item.id
                    ? 'bg-blue-100 text-blue-800 shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
                {item.id === 'admin' && unreadNotifications && unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-4">
            {/* Admin Badge */}
            {isAdmin && (
              <div className="hidden md:flex items-center">
                <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg border-2 border-purple-400 flex items-center gap-2">
                  <span className="text-lg">👑</span>
                  مدير النظام
                </span>
              </div>
            )}

            {/* Profile Picture */}
            <button
              onClick={onProfileClick}
              className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                currentView === 'profile'
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
              title="الملف الشخصي"
            >
              {userProfile?.profilePictureUrl ? (
                <img
                  src={userProfile.profilePictureUrl}
                  alt="صورة الملف الشخصي"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "👤"}
                </div>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-right px-4 py-3 rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
