import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";

export function ArabicSignInForm() {
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          toast.error("كلمات المرور غير متطابقة");
          return;
        }
        if (formData.password.length < 6) {
          toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
          return;
        }
        await signIn("password", {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          flow: "signUp"
        });
        toast.success("تم إنشاء الحساب بنجاح!");
      } else {
        await signIn("password", {
          email: formData.email,
          password: formData.password,
          flow: "signIn"
        });
        toast.success("مرحباً بك!");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      if (error.message?.includes("Invalid login credentials")) {
        toast.error("بيانات الدخول غير صحيحة");
      } else if (error.message?.includes("User already exists")) {
        toast.error("المستخدم موجود بالفعل. جرب تسجيل الدخول.");
      } else {
        toast.error(isSignUp ? "فشل في إنشاء الحساب" : "فشل في تسجيل الدخول");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-2xl mx-auto mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            🏖️
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-400 rounded-full animate-bounce"></div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          شاليهات السعودية
        </h1>
        <p className="text-gray-600 text-lg">منصة الإيجار الأولى في المملكة</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-100"></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-200"></div>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full translate-x-12 translate-y-12"></div>
        </div>

        {/* Form Toggle */}
        <div className="relative mb-8">
          <div className="flex bg-gray-100 rounded-2xl p-1">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                !isSignUp
                  ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                isSignUp
                  ? 'bg-white text-purple-600 shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              إنشاء حساب
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          {/* Name Field (Sign Up Only) */}
          {isSignUp && (
            <div className="space-y-2 animate-fadeIn">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الاسم الكامل
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">👤</span>
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pr-12 pl-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  placeholder="أدخل اسمك الكامل"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-lg">📧</span>
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pr-12 pl-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                placeholder="example@email.com"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-lg">🔒</span>
              </div>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pr-12 pl-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>
          </div>

          {/* Confirm Password Field (Sign Up Only) */}
          {isSignUp && (
            <div className="space-y-2 animate-fadeIn">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-lg">🔐</span>
                </div>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pr-12 pl-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  placeholder="أعد كتابة كلمة المرور"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:scale-105 shadow-xl ${
              isSignUp
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
            } text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{isSignUp ? 'جاري إنشاء الحساب...' : 'جاري تسجيل الدخول...'}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>{isSignUp ? '🚀 إنشاء حساب جديد' : '🎯 تسجيل الدخول'}</span>
              </div>
            )}
          </button>
        </form>




        {/* Features Preview */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-2xl">🏖️</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">شاليهات فاخرة</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-2xl">⚡</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">حجز فوري</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-2xl">🛡️</span>
              </div>
              <p className="text-xs text-gray-600 font-medium">آمن ومضمون</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
