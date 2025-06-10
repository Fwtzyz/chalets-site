import { useState } from "react";

interface SearchFilters {
  city?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  amenities?: string[];
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}

export function EnhancedSearchFilters({ filters, onFiltersChange, onSearch }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const cities = [
    "الرياض", "جدة", "الدمام", "مكة المكرمة", "المدينة المنورة",
    "الطائف", "تبوك", "بريدة", "خميس مشيط", "حائل"
  ];

  const propertyTypes = [
    { value: "chalet", label: "شاليه" },
    { value: "villa", label: "فيلا" },
    { value: "apartment", label: "شقة" },
    { value: "resort", label: "منتجع" }
  ];

  const amenitiesList = [
    "مسبح", "شاطئ خاص", "مطبخ مجهز", "واي فاي", "مكيف",
    "موقف سيارات", "حديقة", "شواء", "جاكوزي", "ألعاب أطفال"
  ];

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    handleFilterChange('amenities', newAmenities);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">البحث والتصفية</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          {isExpanded ? "إخفاء الفلاتر" : "إظهار الفلاتر"}
        </button>
      </div>

      {/* Basic Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">المدينة</label>
          <select
            value={filters.city || ""}
            onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">جميع المدن</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">نوع العقار</label>
          <select
            value={filters.propertyType || ""}
            onChange={(e) => handleFilterChange('propertyType', e.target.value || undefined)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">جميع الأنواع</option>
            {propertyTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">عدد الأشخاص</label>
          <select
            value={filters.guests || ""}
            onChange={(e) => handleFilterChange('guests', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">أي عدد</option>
            {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'شخص' : 'أشخاص'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="space-y-6 border-t pt-6">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">نطاق السعر (ريال/ليلة)</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  placeholder="الحد الأدنى"
                  value={filters.minPrice || ""}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="الحد الأقصى"
                  value={filters.maxPrice || ""}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">المرافق والخدمات</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {amenitiesList.map(amenity => (
                <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(filters.amenities || []).includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onSearch}
          className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          🔍 البحث
        </button>
        <button
          onClick={clearFilters}
          className="bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          مسح الفلاتر
        </button>
      </div>

      {/* Active Filters Display */}
      {(filters.city || filters.propertyType || filters.guests || (filters.amenities && filters.amenities.length > 0)) && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">الفلاتر النشطة:</h3>
          <div className="flex flex-wrap gap-2">
            {filters.city && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                📍 {filters.city}
              </span>
            )}
            {filters.propertyType && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                🏠 {propertyTypes.find(t => t.value === filters.propertyType)?.label}
              </span>
            )}
            {filters.guests && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                👥 {filters.guests} أشخاص
              </span>
            )}
            {filters.amenities && filters.amenities.map(amenity => (
              <span key={amenity} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                ✨ {amenity}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
