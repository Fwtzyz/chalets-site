import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function TestAuth() {
  const user = useQuery(api.auth.loggedInUser);
  const isAdmin = useQuery(api.users.isAdmin);
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">حالة المصادقة</h3>
      
      {user ? (
        <div className="space-y-2">
          <p className="text-green-600">✅ تم تسجيل الدخول بنجاح</p>
          <p><strong>البريد الإلكتروني:</strong> {user.email}</p>
          <p><strong>الاسم:</strong> {user.name || "غير محدد"}</p>
          <p><strong>معرف المستخدم:</strong> {user._id}</p>
          <p><strong>هل هو مدير:</strong> {isAdmin ? "نعم" : "لا"}</p>
          <p><strong>تاريخ الإنشاء:</strong> {new Date(user._creationTime).toLocaleDateString('ar-SA')}</p>
        </div>
      ) : (
        <p className="text-red-600">❌ لم يتم تسجيل الدخول</p>
      )}
    </div>
  );
}
