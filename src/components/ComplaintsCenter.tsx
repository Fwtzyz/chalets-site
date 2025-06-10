import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function ComplaintsCenter() {
  const [activeTab, setActiveTab] = useState("my-complaints");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const userComplaints = useQuery(api.complaints.getUserComplaints);
  const isAdmin = useQuery(api.userProfiles.isCurrentUserAdmin);
  const allComplaints = useQuery(
    api.complaints.getAllComplaints,
    isAdmin ? {} : "skip"
  );
  const complaintStats = useQuery(
    api.complaints.getComplaintStats,
    isAdmin ? {} : "skip"
  );

  const tabs = [
    { id: "my-complaints", label: "شكاويي", icon: "📝", count: userComplaints?.length },
    ...(isAdmin ? [
      { id: "all-complaints", label: "جميع الشكاوي", icon: "📋", count: allComplaints?.length },
      { id: "stats", label: "الإحصائيات", icon: "📊" }
    ] : [])
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {activeTab === "my-complaints" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">شكاويي</h2>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                + تقديم شكوى جديدة
              </button>
            </div>
            {showCreateForm ? (
              <CreateComplaintForm onClose={() => setShowCreateForm(false)} />
            ) : (
              <UserComplaintsList complaints={userComplaints} />
            )}
          </div>
        )}

        {activeTab === "all-complaints" && isAdmin && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">جميع الشكاوي</h2>
            <AdminComplaintsList complaints={allComplaints} />
          </div>
        )}

        {activeTab === "stats" && isAdmin && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">إحصائيات الشكاوي</h2>
            <ComplaintStats stats={complaintStats} />
          </div>
        )}
      </div>
    </div>
  );
}

function CreateComplaintForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other" as const,
    priority: "medium" as const,
    relatedPropertyId: undefined as Id<"properties"> | undefined,
    relatedBookingId: undefined as Id<"bookings"> | undefined,
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createComplaint = useMutation(api.complaints.createComplaint);
  const generateUploadUrl = useMutation(api.complaints.generateUploadUrl);
  const myProperties = useQuery(api.properties.getUserProperties);
  const myBookings = useQuery(api.bookings.getUserBookings);

  const categories = [
    { value: "property_issue", label: "مشكلة في العقار" },
    { value: "booking_problem", label: "مشكلة في الحجز" },
    { value: "payment_issue", label: "مشكلة في الدفع" },
    { value: "user_behavior", label: "سلوك المستخدم" },
    { value: "technical_problem", label: "مشكلة تقنية" },
    { value: "other", label: "أخرى" },
  ];

  const priorities = [
    { value: "low", label: "منخفضة", color: "green" },
    { value: "medium", label: "متوسطة", color: "yellow" },
    { value: "high", label: "عالية", color: "orange" },
    { value: "urgent", label: "عاجلة", color: "red" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload attachments
      const attachmentIds: Id<"_storage">[] = [];
      for (const file of attachments) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        attachmentIds.push(storageId);
      }

      await createComplaint({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        relatedPropertyId: formData.relatedPropertyId,
        relatedBookingId: formData.relatedBookingId,
        attachments: attachmentIds.length > 0 ? attachmentIds : undefined,
      });

      toast.success("تم تقديم الشكوى بنجاح");
      onClose();
    } catch (error) {
      console.error("Error creating complaint:", error);
      toast.error("فشل في تقديم الشكوى");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            عنوان الشكوى *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="اكتب عنوان الشكوى"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع الشكوى
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الأولوية
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {priorities.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>

        {/* Related Property */}
        {myProperties && myProperties.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العقار المرتبط (اختياري)
            </label>
            <select
              value={formData.relatedPropertyId || ""}
              onChange={(e) => setFormData({ 
                ...formData, 
                relatedPropertyId: e.target.value ? e.target.value as Id<"properties"> : undefined 
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">اختر العقار</option>
              {myProperties.map((property: any) => (
                <option key={property._id} value={property._id}>
                  {property.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Related Booking */}
        {myBookings && myBookings.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحجز المرتبط (اختياري)
            </label>
            <select
              value={formData.relatedBookingId || ""}
              onChange={(e) => setFormData({ 
                ...formData, 
                relatedBookingId: e.target.value ? e.target.value as Id<"bookings"> : undefined 
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">اختر الحجز</option>
              {myBookings.map((booking: any) => (
                <option key={booking._id} value={booking._id}>
                  حجز {booking.propertyTitle} - {booking.checkInDate}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          وصف الشكوى *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="اشرح تفاصيل الشكوى بوضوح"
          required
        />
      </div>

      {/* File Attachments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          مرفقات (اختياري)
        </label>
        <input
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={(e) => setAttachments(Array.from(e.target.files || []))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {attachments.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">الملفات المحددة:</p>
            <ul className="text-sm text-gray-500">
              {attachments.map((file, index) => (
                <li key={index}>• {file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
        >
          {isSubmitting ? "جاري التقديم..." : "تقديم الشكوى"}
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
  );
}

function UserComplaintsList({ complaints }: { complaints: any[] | undefined }) {
  if (complaints === undefined) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          لا توجد شكاوى مقدمة
        </h3>
        <p className="text-gray-500">
          يمكنك تقديم شكوى جديدة إذا واجهت أي مشكلة
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "قيد الانتظار";
      case "in_progress": return "قيد المعالجة";
      case "resolved": return "تم الحل";
      case "closed": return "مغلقة";
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "urgent": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "low": return "منخفضة";
      case "medium": return "متوسطة";
      case "high": return "عالية";
      case "urgent": return "عاجلة";
      default: return priority;
    }
  };

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <div key={complaint._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{complaint.title}</h3>
              <p className="text-gray-600 mb-3">{complaint.description}</p>
            </div>
            <div className="flex flex-col gap-2 ml-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                {getStatusText(complaint.status)}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                {getPriorityText(complaint.priority)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span>📅 {new Date(complaint._creationTime).toLocaleDateString('ar-SA')}</span>
            <span>🏷️ {complaint.category}</span>
          </div>

          {complaint.attachmentUrls && complaint.attachmentUrls.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">المرفقات:</p>
              <div className="flex gap-2">
                {complaint.attachmentUrls.map((url: string, index: number) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    📎 مرفق {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {complaint.adminResponse && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm font-medium text-blue-800 mb-2">رد الإدارة:</p>
              <p className="text-blue-700">{complaint.adminResponse}</p>
              {complaint.admin && (
                <p className="text-xs text-blue-600 mt-2">
                  بواسطة: {complaint.admin.name} • {new Date(complaint.updatedAt).toLocaleDateString('ar-SA')}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AdminComplaintsList({ complaints }: { complaints: any[] | undefined }) {
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const updateComplaintStatus = useMutation(api.complaints.updateComplaintStatus);

  if (complaints === undefined) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  if (complaints.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          لا توجد شكاوى
        </h3>
      </div>
    );
  }

  const handleStatusUpdate = async (complaintId: Id<"complaints">, status: string, response?: string) => {
    try {
      await updateComplaintStatus({
        complaintId,
        status: status as any,
        adminResponse: response,
      });
      toast.success("تم تحديث حالة الشكوى");
      setSelectedComplaint(null);
    } catch (error) {
      toast.error("فشل في تحديث الشكوى");
    }
  };

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <div key={complaint._id} className="border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{complaint.title}</h3>
              <p className="text-gray-600 mb-2">{complaint.description}</p>
              <p className="text-sm text-gray-500">
                بواسطة: {complaint.user?.name} • {new Date(complaint._creationTime).toLocaleDateString('ar-SA')}
              </p>
            </div>
            <button
              onClick={() => setSelectedComplaint(complaint)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              إدارة
            </button>
          </div>
        </div>
      ))}

      {/* Admin Response Modal */}
      {selectedComplaint && (
        <AdminResponseModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}

function AdminResponseModal({ 
  complaint, 
  onClose, 
  onUpdate 
}: { 
  complaint: any; 
  onClose: () => void; 
  onUpdate: (id: Id<"complaints">, status: string, response?: string) => void;
}) {
  const [status, setStatus] = useState(complaint.status);
  const [response, setResponse] = useState(complaint.adminResponse || "");

  const statuses = [
    { value: "pending", label: "قيد الانتظار" },
    { value: "in_progress", label: "قيد المعالجة" },
    { value: "resolved", label: "تم الحل" },
    { value: "closed", label: "مغلقة" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">إدارة الشكوى</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">{complaint.title}</h3>
            <p className="text-gray-600">{complaint.description}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحالة
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رد الإدارة
            </label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="اكتب رد الإدارة..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => onUpdate(complaint._id, status, response)}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            >
              تحديث
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplaintStats({ stats }: { stats: any }) {
  if (!stats) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-blue-800">إجمالي الشكاوى</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-yellow-800">قيد الانتظار</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
          <div className="text-sm text-purple-800">قيد المعالجة</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          <div className="text-sm text-green-800">تم الحل</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
          <div className="text-sm text-gray-800">مغلقة</div>
        </div>
      </div>

      {/* Category Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">الشكاوى حسب النوع</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span>مشاكل العقارات</span>
            <span className="font-bold">{stats.byCategory.property_issue}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span>مشاكل الحجز</span>
            <span className="font-bold">{stats.byCategory.booking_problem}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span>مشاكل الدفع</span>
            <span className="font-bold">{stats.byCategory.payment_issue}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span>سلوك المستخدمين</span>
            <span className="font-bold">{stats.byCategory.user_behavior}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span>مشاكل تقنية</span>
            <span className="font-bold">{stats.byCategory.technical_problem}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span>أخرى</span>
            <span className="font-bold">{stats.byCategory.other}</span>
          </div>
        </div>
      </div>

      {/* Priority Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">الشكاوى حسب الأولوية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <span>منخفضة</span>
            <span className="font-bold text-green-600">{stats.byPriority.low}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
            <span>متوسطة</span>
            <span className="font-bold text-yellow-600">{stats.byPriority.medium}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
            <span>عالية</span>
            <span className="font-bold text-orange-600">{stats.byPriority.high}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
            <span>عاجلة</span>
            <span className="font-bold text-red-600">{stats.byPriority.urgent}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
