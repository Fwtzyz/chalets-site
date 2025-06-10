import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { PropertyMap } from "./PropertyMap";

interface SearchFilters {
  searchTerm?: string;
  city?: string;
  district?: string;
  propertyType?: "chalet" | "villa" | "apartment" | "resort";
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

interface EnhancedPropertyListProps {
  searchFilters: SearchFilters;
  onViewProperty: (propertyId: any) => void;
}

export function EnhancedPropertyList({ searchFilters, onViewProperty }: EnhancedPropertyListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const properties = useQuery(api.properties.getProperties, searchFilters);

  const formatPrice = (price: number) => {
    return price.toLocaleString() + ' ريال';
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels = {
      chalet: "شاليه",
      villa: "فيلا",
      apartment: "شقة",
      resort: "منتجع"
    };
    return labels[type as keyof typeof labels] || type;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  if (properties === undefined) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with view controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            العقارات المتاحة ({properties.length})
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            اكتشف أفضل العقارات للإيجار في المملكة
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <span className="mr-2">⊞</span>
            شبكة
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <span className="mr-2">☰</span>
            قائمة
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'map'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <span className="mr-2">🗺️</span>
            خريطة
          </button>
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="h-96 lg:h-[500px]">
          <PropertyMap
            onPropertySelect={(propertyId) => {
              setSelectedPropertyId(propertyId);
              onViewProperty(propertyId);
            }}
            selectedPropertyId={selectedPropertyId}
            className="h-full"
          />
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <>
          {properties.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                لا توجد عقارات متطابقة
              </h3>
              <p className="text-gray-500">
                جرب تعديل معايير البحث للعثور على عقارات أخرى
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div
                  key={property._id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 cursor-pointer transform hover:-translate-y-1"
                  onClick={() => onViewProperty(property._id)}
                >
                  {/* Property Image */}
                  <div className="relative h-48 overflow-hidden">
                    {property.imageUrls && property.imageUrls.length > 0 ? (
                      <img
                        src={property.imageUrls[0] || ""}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
                        <span className="text-4xl">🏖️</span>
                      </div>
                    )}
                    
                    {/* Property Type Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                      {getPropertyTypeLabel(property.propertyType)}
                    </div>
                    
                    {/* Price Badge */}
                    <div className="absolute bottom-3 left-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {formatPrice(property.price)}/ليلة
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {property.title}
                    </h3>

                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <span className="mr-1">📍</span>
                      <span>{property.location.district}, {property.location.city}</span>
                    </div>

                    {/* Rating */}
                    {property.rating && property.rating > 0 ? (
                      <div className="flex items-center gap-2 mb-3">
                        {renderStars(Math.round(property.rating))}
                        <span className="text-sm font-medium text-gray-700">
                          {property.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({property.reviewCount} تقييم)
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 mb-3">لا توجد تقييمات بعد</div>
                    )}

                    {/* Property Features */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <span>🛏️</span>
                        <span>{typeof property.capacity === 'object' ? property.capacity.bedrooms : 1}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🚿</span>
                        <span>{typeof property.capacity === 'object' ? property.capacity.bathrooms : 1}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>👥</span>
                        <span>{typeof property.capacity === 'object' ? property.capacity.guests : property.capacity}</span>
                      </div>
                    </div>

                    {/* Amenities Preview */}
                    {property.amenities && property.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {property.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs"
                          >
                            {amenity}
                          </span>
                        ))}
                        {property.amenities.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                            +{property.amenities.length - 3} المزيد
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform group-hover:scale-105">
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {properties.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                لا توجد عقارات متطابقة
              </h3>
              <p className="text-gray-500">
                جرب تعديل معايير البحث للعثور على عقارات أخرى
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => (
                <div
                  key={property._id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 cursor-pointer"
                  onClick={() => onViewProperty(property._id)}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Property Image */}
                    <div className="relative w-full md:w-80 h-48 md:h-auto overflow-hidden">
                      {property.imageUrls && property.imageUrls.length > 0 ? (
                        <img
                          src={property.imageUrls[0] || ""}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
                          <span className="text-4xl">🏖️</span>
                        </div>
                      )}
                      
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                        {getPropertyTypeLabel(property.propertyType)}
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {property.title}
                        </h3>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatPrice(property.price)}
                          </div>
                          <div className="text-sm text-gray-500">لكل ليلة</div>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <span className="mr-1">📍</span>
                        <span>{property.location.district}, {property.location.city}</span>
                      </div>

                      {/* Rating */}
                      {property.rating && property.rating > 0 ? (
                        <div className="flex items-center gap-2 mb-3">
                          {renderStars(Math.round(property.rating))}
                          <span className="text-sm font-medium text-gray-700">
                            {property.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({property.reviewCount} تقييم)
                          </span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 mb-3">لا توجد تقييمات بعد</div>
                      )}

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {property.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <span>🛏️</span>
                            <span>{typeof property.capacity === 'object' ? property.capacity.bedrooms : 1} غرف</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>🚿</span>
                            <span>{typeof property.capacity === 'object' ? property.capacity.bathrooms : 1} حمام</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>👥</span>
                            <span>{typeof property.capacity === 'object' ? property.capacity.guests : property.capacity} أشخاص</span>
                          </div>
                        </div>

                        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all">
                          عرض التفاصيل
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
