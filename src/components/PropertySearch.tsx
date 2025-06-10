import { useState } from "react";

interface SearchFilters {
  searchTerm: string;
  city: string;
  district: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
}

interface PropertySearchProps {
  onSearch?: (filters: SearchFilters) => void;
}

export function PropertySearch({ onSearch }: PropertySearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    city: "",
    district: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const saudiCities = [
    "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", 
    "الطائف", "أبها", "تبوك", "بريدة", "خميس مشيط", "الهفوف", "حائل", 
    "نجران", "الجبيل", "ينبع", "الخرج", "عرعر", "سكاكا", "جازان"
  ];

  const propertyTypes = [
    { value: "chalet", label: "شاليه" },
    { value: "villa", label: "فيلا" },
    { value: "apartment", label: "شقة" },
    { value: "resort", label: "منتجع" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(filters);
  };

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البحث
            </label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => handleInputChange("searchTerm", e.target.value)}
              placeholder="ابحث عن شاليه أو فيلا..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المدينة
            </label>
            <select
              value={filters.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">جميع المدن</option>
              {saudiCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع العقار
            </label>
            <select
              value={filters.propertyType}
              onChange={(e) => handleInputChange("propertyType", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">جميع الأنواع</option>
              {propertyTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            {showAdvanced ? "إخفاء الفلاتر المتقدمة" : "إظهار الفلاتر المتقدمة"}
            <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحي
              </label>
              <input
                type="text"
                value={filters.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                placeholder="اسم الحي"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر الأدنى (ريال)
              </label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleInputChange("minPrice", e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر الأعلى (ريال)
              </label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleInputChange("maxPrice", e.target.value)}
                placeholder="10000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التقييم الأدنى
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => handleInputChange("minRating", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">جميع التقييمات</option>
                <option value="4">4 نجوم فأكثر</option>
                <option value="3">3 نجوم فأكثر</option>
                <option value="2">2 نجوم فأكثر</option>
                <option value="1">1 نجمة فأكثر</option>
              </select>
            </div>
          </div>
        )}

        {/* Search Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
          >
            🔍 البحث
          </button>
        </div>
      </form>
    </div>
  );
}
