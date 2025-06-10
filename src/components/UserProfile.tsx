import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function UserProfile() {
  const user = useQuery(api.auth.loggedInUser);
  const profile = useQuery(api.userProfiles.getProfileByUserId, user?._id ? { userId: user._id } : "skip");
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    bio: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Mutations
  const updateProfile = useMutation(api.userProfiles.updateProfile);
  const updateProfilePicture = useMutation(api.userProfiles.updateProfilePicture);
  const generateUploadUrl = useMutation(api.userProfiles.generateProfilePictureUploadUrl);

  // Initialize edit data when profile loads
  useEffect(() => {
    if (profile) {
      setEditData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phoneNumber: profile.phoneNumber || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleEdit = () => {
    if (profile) {
      setEditData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phoneNumber: profile.phoneNumber || "",
        bio: profile.bio || "",
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        firstName: editData.firstName || undefined,
        lastName: editData.lastName || undefined,
        phoneNumber: editData.phoneNumber || undefined,
        bio: editData.bio || undefined,
      });
      toast.success("تم تحديث الملف الشخصي بنجاح!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error("فشل في تحديث الملف الشخصي: " + error.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setEditData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phoneNumber: profile.phoneNumber || "",
        bio: profile.bio || "",
      });
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setUploading(true);
    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload the file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });

      if (!result.ok) {
        throw new Error("فشل في رفع الصورة");
      }

      const { storageId } = await result.json();

      // Update profile with new image
      await updateProfilePicture({ profilePicture: storageId });
      
      toast.success("تم تحديث الصورة الشخصية بنجاح!");
      setSelectedImage(null);
    } catch (error: any) {
      toast.error("فشل في رفع الصورة: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">يرجى تسجيل الدخول لعرض الملف الشخصي</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">الملف الشخصي</h1>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              ✏️ تعديل
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                ✅ حفظ
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                ❌ إلغاء
              </button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">المعلومات الأساسية</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">البريد الإلكتروني</label>
              <p className="text-gray-800 bg-gray-50 p-2 rounded">{user.email || "غير محدد"}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">الاسم (من النظام)</label>
              <p className="text-gray-800 bg-gray-50 p-2 rounded">{user.name || "غير محدد"}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">الاسم الأول</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.firstName}
                  onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="أدخل الاسم الأول"
                />
              ) : (
                <p className="text-gray-800">{profile?.firstName || "غير محدد"}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">الاسم الأخير</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.lastName}
                  onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="أدخل الاسم الأخير"
                />
              ) : (
                <p className="text-gray-800">{profile?.lastName || "غير محدد"}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">رقم الهاتف</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editData.phoneNumber}
                  onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="أدخل رقم الهاتف"
                  dir="ltr"
                />
              ) : (
                <p className="text-gray-800">{profile?.phoneNumber || "غير محدد"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">نبذة شخصية</label>
              {isEditing ? (
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="اكتب نبذة عن نفسك"
                  rows={3}
                />
              ) : (
                <p className="text-gray-800">{profile?.bio || "غير محدد"}</p>
              )}
            </div>
          </div>
          
          {/* Profile Picture */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">الصورة الشخصية</h2>
            
            <div className="flex flex-col items-center justify-center space-y-4">
              {profile?.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt="الصورة الشخصية"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg border-4 border-gray-200">
                  {user.name ? user.name.charAt(0).toUpperCase() : "👤"}
                </div>
              )}
              
              {/* Profile Picture Upload */}
              <div className="text-center space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                  className="hidden"
                  id="profile-picture-upload"
                />
                <label
                  htmlFor="profile-picture-upload"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer inline-block"
                >
                  📷 اختيار صورة جديدة
                </label>
                
                {selectedImage && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      تم اختيار: {selectedImage.name}
                    </p>
                    <button
                      onClick={handleImageUpload}
                      disabled={uploading}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {uploading ? "جاري الرفع..." : "رفع الصورة"}
                    </button>
                  </div>
                )}
              </div>
              
              {/* Profile Picture Status */}
              <div className="text-center">
                {profile?.profilePictureUrl ? (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    ✅ تم رفع الصورة
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    📷 لم يتم رفع صورة
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Profile Info */}
        {profile && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Verification Status */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">حالة التحقق</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                profile.verificationStatus === "verified" 
                  ? "bg-green-100 text-green-800"
                  : profile.verificationStatus === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {profile.verificationStatus === "verified" 
                  ? "✅ محقق"
                  : profile.verificationStatus === "pending"
                  ? "⏳ قيد المراجعة"
                  : "❌ غير محقق"}
              </span>
            </div>

            {/* Admin Status */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">نوع الحساب</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                profile.isAdmin 
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }`}>
                {profile.isAdmin ? "👑 مدير النظام" : "👤 مستخدم عادي"}
              </span>
            </div>
          </div>
        )}

        {/* Account Creation Date */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">معلومات الحساب</h3>
          <div className="text-sm text-gray-600">
            <p>📅 تاريخ إنشاء الحساب: {new Date(user._creationTime).toLocaleDateString('ar-SA')}</p>
            {user.isAnonymous && (
              <p className="mt-1">🎭 حساب ضيف (مؤقت)</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
