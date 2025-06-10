import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";

export function LoginForm() {
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create FormData for Convex Auth
      const formDataObj = new FormData();
      formDataObj.set("email", formData.email);
      formDataObj.set("password", formData.password);
      formDataObj.set("flow", flow);

      // Sign in with Convex Auth
      await signIn("password", formDataObj);

      toast.success(flow === "signIn" ? "تم تسجيل الدخول بنجاح!" : "تم إنشاء الحساب بنجاح!");
      
    } catch (error: any) {
      console.error("Auth error:", error);
      let errorMessage = "فشل في تسجيل الدخول";
      
      if (error.message?.includes("Invalid password")) {
        errorMessage = "كلمة المرور غير صحيحة";
      } else if (error.message?.includes("User not found")) {
        errorMessage = flow === "signIn" 
          ? "المستخدم غير موجود، هل تريد إنشاء حساب جديد؟"
          : "فشل في إنشاء الحساب";
      } else if (error.message?.includes("User already exists")) {
        errorMessage = "المستخدم موجود بالفعل، جرب تسجيل الدخول";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {flow === "signIn" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
        </h2>
        <p className="text-gray-600">
          {flow === "signIn" 
            ? "ادخل بياناتك للوصول إلى حسابك"
            : "أنشئ حساباً جديداً للبدء"
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            كلمة المرور
          </label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading 
            ? (flow === "signIn" ? "جاري تسجيل الدخول..." : "جاري إنشاء الحساب...")
            : (flow === "signIn" ? "تسجيل الدخول" : "إنشاء حساب")
          }
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {flow === "signIn" ? "ليس لديك حساب؟ " : "لديك حساب بالفعل؟ "}
          <button 
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {flow === "signIn" ? "إنشاء حساب جديد" : "تسجيل الدخول"}
          </button>
        </p>
      </div>

      <div className="flex items-center justify-center my-4">
        <hr className="flex-1 border-gray-200" />
        <span className="mx-4 text-sm text-gray-500">أو</span>
        <hr className="flex-1 border-gray-200" />
      </div>

      <button 
        onClick={() => signIn("anonymous")}
        className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-all font-medium"
      >
        دخول كضيف
      </button>
    </div>
  );
}
