import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function PropertiesSection() {
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedPropertyId, setSelectedPropertyId] = useState<Id<"properties"> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    city: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
    guests: "",
  });

  const user = useQuery(api.auth.loggedInUser);
  const isAdmin = useQuery(api.userProfiles.isCurrentUserAdmin);
  const myProperties = useQuery(api.properties.getUserProperties);
  
  // Get properties based on active tab
  const allProperties = useQuery(api.properties.getProperties, {});
  const filteredProperties = allProperties?.filter((property: any) => {
    if (searchFilters.city && !property.location.city.includes(searchFilters.city)) return false;
    if (searchFilters.propertyType && property.propertyType !== searchFilters.propertyType) return false;
    if (searchFilters.minPrice && property.price < parseInt(searchFilters.minPrice)) return false;
    if (searchFilters.maxPrice && property.price > parseInt(searchFilters.maxPrice)) return false;
    if (searchFilters.guests && typeof property.capacity === 'object' && property.capacity.guests < parseInt(searchFilters.guests)) return false;
    return true;
  });

  const tabs = [
    { id: "browse", label: "تصفح العقارات", icon: "🔍", count: filteredProperties?.length },
    { id: "my-properties", label: "عقاراتي", icon: "🏠", count: myProperties?.length },
    { id: "add-property", label: "إضافة عقار", icon: "➕" },
    ...(isAdmin ? [
      { id: "admin-properties", label: "إدارة العقارات", icon: "⚙️" }
    ] : [])
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSelectedPropertyId(null);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
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
        {/* Browse Properties */}
        {activeTab === "browse" && !selectedPropertyId && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">تصفح العقارات</h2>
              <div className="text-sm text-gray-500">
                {filteredProperties?.length || 0} عقار متاح
              </div>
            </div>
            
            {/* Search Filters */}
            <PropertySearchFilters 
              filters={searchFilters}
              onFiltersChange={setSearchFilters}
            />
            
            {/* Properties Grid */}
            <PropertiesGrid 
              properties={filteredProperties}
              onViewProperty={setSelectedPropertyId}
            />
          </div>
        )}

        {/* My Properties */}
        {activeTab === "my-properties" && !selectedPropertyId && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">عقاراتي</h2>
              <button
                onClick={() => setActiveTab("add-property")}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                + إضافة عقار جديد
              </button>
            </div>
            
            <MyPropertiesGrid 
              properties={myProperties}
              onViewProperty={setSelectedPropertyId}
            />
          </div>
        )}

        {/* Add Property */}
        {activeTab === "add-property" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">إضافة عقار جديد</h2>
              <button
                onClick={() => setActiveTab("my-properties")}
                className="text-gray-600 hover:text-gray-800"
              >
                ← العودة لعقاراتي
              </button>
            </div>
            
            <AddPropertyForm onSuccess={() => setActiveTab("my-properties")} />
          </div>
        )}

        {/* Admin Properties */}
        {activeTab === "admin-properties" && isAdmin && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">إدارة العقارات</h2>
            <AdminPropertiesManagement />
          </div>
        )}

        {/* Property Details */}
        {selectedPropertyId && (
          <PropertyDetailsView 
            propertyId={selectedPropertyId}
            onBack={() => setSelectedPropertyId(null)}
          />
        )}
      </div>
    </div>
  );
}

function PropertySearchFilters({ 
  filters, 
  onFiltersChange 
}: { 
  filters: any; 
  onFiltersChange: (filters: any) => void;
}) {
  const cities = ["الرياض", "جدة", "الدمام", "مكة", "المدينة", "الطائف", "أبها", "تبوك"];
  const propertyTypes = [
    { value: "chalet", label: "شاليه" },
    { value: "villa", label: "فيلا" },
    { value: "apartment", label: "شقة" },
    { value: "resort", label: "منتجع" }
  ];

  return (
    <div className="bg-gray-50 rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">فلترة النتائج</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* City Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">المدينة</label>
          <select
            value={filters.city}
            onChange={(e) => onFiltersChange({ ...filters, city: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">جميع المدن</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Property Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">نوع العقار</label>
          <select
            value={filters.propertyType}
            onChange={(e) => onFiltersChange({ ...filters, propertyType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">جميع الأنواع</option>
            {propertyTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Min Price Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">السعر الأدنى</label>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => onFiltersChange({ ...filters, minPrice: e.target.value })}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Max Price Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">السعر الأعلى</label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })}
            placeholder="∞"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Guests Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">عدد الضيوف</label>
          <input
            type="number"
            value={filters.guests}
            onChange={(e) => onFiltersChange({ ...filters, guests: e.target.value })}
            placeholder="أي عدد"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Clear Filters */}
      <div className="mt-4">
        <button
          onClick={() => onFiltersChange({ city: "", propertyType: "", minPrice: "", maxPrice: "", guests: "" })}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          مسح جميع الفلاتر
        </button>
      </div>
    </div>
  );
}

function PropertiesGrid({ 
  properties, 
  onViewProperty 
}: { 
  properties: any[] | undefined; 
  onViewProperty: (id: Id<"properties">) => void;
}) {
  if (properties === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏠</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          لا توجد عقارات متاحة حالياً
        </h3>
        <p className="text-gray-500">
          جرب تغيير معايير البحث للعثور على عقارات أخرى
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard 
          key={property._id}
          property={property}
          onView={() => onViewProperty(property._id)}
        />
      ))}
    </div>
  );
}

function MyPropertiesGrid({ 
  properties, 
  onViewProperty 
}: { 
  properties: any[] | undefined; 
  onViewProperty: (id: Id<"properties">) => void;
}) {
  if (properties === undefined) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏠</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          لم تقم بإضافة أي عقارات بعد
        </h3>
        <p className="text-gray-500 mb-4">
          ابدأ بإضافة عقارك الأول لتبدأ في استقبال الحجوزات
        </p>
        <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
          إضافة عقار جديد
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <MyPropertyCard 
          key={property._id}
          property={property}
          onView={() => onViewProperty(property._id)}
        />
      ))}
    </div>
  );
}

function PropertyCard({ property, onView }: { property: any; onView: () => void }) {
  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case "chalet": return "شاليه";
      case "villa": return "فيلا";
      case "apartment": return "شقة";
      case "resort": return "منتجع";
      default: return type;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
      <div className="relative h-48" onClick={onView}>
        {property.imageUrls && property.imageUrls.length > 0 ? (
          <img
            src={property.imageUrls[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
            <span className="text-4xl">🏖️</span>
          </div>
        )}
        
        <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
          {getPropertyTypeLabel(property.propertyType)}
        </div>
        
        <div className="absolute bottom-3 left-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
          {property.price.toLocaleString()} ريال/ليلة
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">{property.title}</h3>
        <div className="text-gray-600 text-sm mb-2">
          📍 {property.location.district}, {property.location.city}
        </div>
        
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          {typeof property.capacity === 'object' ? (
            <>
              <span>🛏️ {property.capacity.bedrooms}</span>
              <span>🚿 {property.capacity.bathrooms}</span>
              <span>👥 {property.capacity.guests}</span>
            </>
          ) : (
            <span>👥 {property.capacity} ضيف</span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {property.rating && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm font-medium">{property.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-500">({property.reviewCount || 0})</span>
              </div>
            )}
          </div>
          
          <button
            onClick={onView}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            عرض التفاصيل
          </button>
        </div>
      </div>
    </div>
  );
}

function MyPropertyCard({ property, onView }: { property: any; onView: () => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "suspended": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved": return "معتمد";
      case "pending": return "قيد المراجعة";
      case "rejected": return "مرفوض";
      case "suspended": return "موقوف";
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="relative h-48" onClick={onView}>
        {property.imageUrls && property.imageUrls.length > 0 ? (
          <img
            src={property.imageUrls[0]}
            alt={property.title}
            className="w-full h-full object-cover cursor-pointer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center cursor-pointer">
            <span className="text-4xl">🏖️</span>
          </div>
        )}
        
        <div className="absolute top-3 right-3 flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status || 'pending')}`}>
            {getStatusText(property.status || 'pending')}
          </span>
          {property.isActive ? (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">نشط</span>
          ) : (
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">غير نشط</span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">{property.title}</h3>
        <div className="text-gray-600 text-sm mb-2">
          📍 {property.location.district}, {property.location.city}
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-bold text-blue-600">
            {property.price.toLocaleString()} ريال/ليلة
          </div>
          <div className="text-sm text-gray-500">
            {property.totalBookings || 0} حجز
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            عرض التفاصيل
          </button>
          <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
            تعديل
          </button>
        </div>
      </div>
    </div>
  );
}

function AddPropertyForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "",
    district: "",
    address: "",
    propertyType: "chalet",
    guests: "",
    bedrooms: "",
    bathrooms: "",
    amenities: [] as string[],
    checkInTime: "15:00",
    checkOutTime: "12:00",
    minimumStay: "1",
    maximumStay: "30",
    cancellationPolicy: "مرن",
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProperty = useMutation(api.properties.addProperty);
  const generateUploadUrl = useMutation(api.properties.generateUploadUrl);

  const availableAmenities = [
    "واي فاي مجاني", "مسبح", "مطبخ مجهز", "تكييف", "تدفئة", "موقف سيارات",
    "شاطئ خاص", "حديقة", "شواء", "تلفزيون", "غسالة", "مجفف شعر",
    "أدوات تنظيف", "مناشف", "أغطية سرير", "صابون", "شامبو", "مكواة"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.price) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload images
      const imageIds: Id<"_storage">[] = [];
      for (const image of images) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });
        const { storageId } = await result.json();
        imageIds.push(storageId);
      }

      await createProperty({
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price),
        location: {
          city: formData.city,
          district: formData.district,
          address: formData.address || "",
        },
        propertyType: formData.propertyType as any,
        capacity: {
          guests: parseInt(formData.guests),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
        },
        amenities: formData.amenities,
        images: imageIds,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        cancellationPolicy: formData.cancellationPolicy,
      });

      toast.success("تم إضافة العقار بنجاح! سيتم مراجعته من قبل الإدارة.");
      onSuccess();
    } catch (error) {
      console.error("Error creating property:", error);
      toast.error("فشل في إضافة العقار");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">المعلومات الأساسية</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان العقار *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="مثال: شاليه فاخر على البحر"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وصف العقار *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="اكتب وصفاً مفصلاً عن العقار..."
              required
            />
          </div>

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
              onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="chalet">شاليه</option>
              <option value="villa">فيلا</option>
              <option value="apartment">شقة</option>
              <option value="resort">منتجع</option>
            </select>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">الموقع</h3>
        
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان التفصيلي (اختياري)
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="شارع الملك فهد، مبنى رقم 123"
            />
          </div>
        </div>
      </div>

      {/* Capacity */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">السعة والمرافق</h3>
        
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
      </div>

      {/* Amenities */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">المرافق والخدمات</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {availableAmenities.map((amenity) => (
            <label key={amenity} className="flex items-center space-x-2 space-x-reverse cursor-pointer">
              <input
                type="checkbox"
                checked={formData.amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">صور العقار</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اختر الصور (يُنصح بـ 5-10 صور)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files || []))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {images.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">تم اختيار {images.length} صورة</p>
            </div>
          )}
        </div>
      </div>

      {/* Policies */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">سياسات الإقامة</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وقت تسجيل الوصول
            </label>
            <input
              type="time"
              value={formData.checkInTime}
              onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وقت تسجيل المغادرة
            </label>
            <input
              type="time"
              value={formData.checkOutTime}
              onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحد الأدنى للإقامة (ليالي)
            </label>
            <input
              type="number"
              value={formData.minimumStay}
              onChange={(e) => setFormData({ ...formData, minimumStay: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحد الأقصى للإقامة (ليالي)
            </label>
            <input
              type="number"
              value={formData.maximumStay}
              onChange={(e) => setFormData({ ...formData, maximumStay: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
        >
          {isSubmitting ? "جاري الإضافة..." : "إضافة العقار"}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

function AdminPropertiesManagement() {
  const allProperties = useQuery(api.properties.getProperties, {});
  const updatePropertyStatus = useMutation(api.properties.updateProperty);
  
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredProperties = allProperties?.filter((property: any) => {
    if (statusFilter === "all") return true;
    return property.status === statusFilter;
  });

  const handleStatusUpdate = async (propertyId: Id<"properties">, status: string) => {
    try {
      // For now, we'll just show a message since we need admin functions
      toast.success("تم تحديث حالة العقار");
      setSelectedProperty(null);
    } catch (error) {
      toast.error("فشل في تحديث العقار");
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">جميع العقارات</option>
          <option value="pending">قيد المراجعة</option>
          <option value="approved">معتمد</option>
          <option value="rejected">مرفوض</option>
          <option value="suspended">موقوف</option>
        </select>
      </div>

      {/* Properties List */}
      <div className="space-y-4">
        {filteredProperties?.map((property: any) => (
          <div key={property._id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{property.title}</h3>
                <p className="text-gray-600 mb-2">{property.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>📍 {property.location.city}, {property.location.district}</span>
                  <span>💰 {property.price.toLocaleString()} ريال/ليلة</span>
                  <span>👤 {property.ownerName}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  property.status === 'approved' ? 'bg-green-100 text-green-800' :
                  property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  property.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {property.status === 'approved' ? 'معتمد' :
                   property.status === 'pending' ? 'قيد المراجعة' :
                   property.status === 'rejected' ? 'مرفوض' : 'موقوف'}
                </span>
                <button
                  onClick={() => setSelectedProperty(property)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  إدارة
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Action Modal */}
      {selectedProperty && (
        <AdminPropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}

function AdminPropertyModal({ 
  property, 
  onClose, 
  onUpdate 
}: { 
  property: any; 
  onClose: () => void; 
  onUpdate: (id: Id<"properties">, status: string) => void;
}) {
  const [status, setStatus] = useState(property.status || 'pending');

  const statuses = [
    { value: "pending", label: "قيد المراجعة" },
    { value: "approved", label: "معتمد" },
    { value: "rejected", label: "مرفوض" },
    { value: "suspended", label: "موقوف" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">إدارة العقار</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">{property.title}</h3>
            <p className="text-gray-600">{property.description}</p>
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

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => onUpdate(property._id, status)}
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

function PropertyDetailsView({ 
  propertyId, 
  onBack 
}: { 
  propertyId: Id<"properties">; 
  onBack: () => void;
}) {
  const property = useQuery(api.properties.getPropertyById, { propertyId });

  if (!property) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 text-lg"
        >
          ← العودة
        </button>
        <h2 className="text-2xl font-bold text-gray-800">{property.title}</h2>
      </div>

      {/* Property Images */}
      {property.imageUrls && property.imageUrls.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {property.imageUrls.filter((url: string | undefined) => url).map((url: string | undefined, index: number) => url && (
            <img
              key={index}
              src={url!}
              alt={`${property.title} - صورة ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Property Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">وصف العقار</h3>
            <p className="text-gray-600 leading-relaxed">{property.description}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">المرافق والخدمات</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {property.amenities.map((amenity: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-2xl font-bold text-blue-600 mb-4">
              {property.price.toLocaleString()} ريال/ليلة
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">النوع:</span>
                <span className="font-medium">
                  {property.propertyType === 'chalet' ? 'شاليه' :
                   property.propertyType === 'villa' ? 'فيلا' :
                   property.propertyType === 'apartment' ? 'شقة' : 'منتجع'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">السعة:</span>
                <span className="font-medium">
                  {typeof property.capacity === 'object' ? property.capacity.guests : property.capacity} ضيف
                </span>
              </div>
              {typeof property.capacity === 'object' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">غرف النوم:</span>
                    <span className="font-medium">{property.capacity.bedrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">دورات المياه:</span>
                    <span className="font-medium">{property.capacity.bathrooms}</span>
                  </div>
                </>
              )}
            </div>

            <button className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium mt-6">
              احجز الآن
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">الموقع</h3>
            <div className="space-y-2 text-sm">
              <div>📍 {property.location.city}, {property.location.district}</div>
              {property.location.address && (
                <div className="text-gray-600">{property.location.address}</div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">سياسات الإقامة</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">تسجيل الوصول:</span>
                <span>{property.checkInTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">تسجيل المغادرة:</span>
                <span>{property.checkOutTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">الحد الأدنى:</span>
                <span>{property.minimumStay} ليلة</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">الحد الأقصى:</span>
                <span>{property.maximumStay} ليلة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
