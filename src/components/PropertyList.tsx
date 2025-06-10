import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface SearchFilters {
  searchTerm?: string;
  city?: string;
  district?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

interface PropertyListProps {
  searchFilters?: SearchFilters;
  onViewProperty?: (propertyId: any) => void;
  properties?: any[];
  showOwnerActions?: boolean;
}

export function PropertyList({ searchFilters = {}, onViewProperty, properties: propProperties, showOwnerActions = false }: PropertyListProps) {
  const searchedProperties = useQuery(
    api.properties.getProperties, 
    propProperties ? "skip" : {
      searchTerm: searchFilters.searchTerm || undefined,
      city: searchFilters.city || undefined,
      district: searchFilters.district || undefined,
      propertyType: searchFilters.propertyType as "chalet" | "villa" | "apartment" | "resort" | undefined,
      minPrice: searchFilters.minPrice || undefined,
      maxPrice: searchFilters.maxPrice || undefined,
      minRating: searchFilters.minRating || undefined,

    }
  );

  const properties = propProperties || searchedProperties;

  if (properties === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-6 space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏖️</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          لا توجد عقارات متاحة
        </h3>
        <p className="text-gray-500">
          جرب تغيير معايير البحث أو تصفح جميع العقارات
        </p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} ريال / ليلة`;
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
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "text-yellow-400" : "text-gray-300"}>
          ⭐
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          العقارات المتاحة ({properties.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property: any) => (
          <div key={property._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:scale-105 border border-blue-100">
            {/* Property Image */}
            <div className="relative h-48 overflow-hidden">
              {property.imageUrls && property.imageUrls.length > 0 ? (
                <img
                  src={property.imageUrls[0] || ""}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <span className="text-4xl">🏖️</span>
                </div>
              )}
              
              {/* Property Type Badge */}
              <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {getPropertyTypeLabel(property.propertyType)}
              </div>

              {/* Rating Badge */}
              {property.averageRating && (
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm font-medium">{property.averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                {property.title}
              </h3>
              
              <div className="flex items-center text-gray-600 mb-3">
                <span className="text-sm">📍</span>
                <span className="text-sm mr-1">
                  {property.location.district}, {property.location.city}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {property.description}
              </p>

              {/* Property Features */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <span>🛏️</span>
                  <span>{property.bedrooms} غرف</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🚿</span>
                  <span>{property.bathrooms} حمام</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>👥</span>
                  <span>{property.capacity} أشخاص</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex justify-between items-center">
                <div className="text-lg font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                  {formatPrice(property.price)}
                </div>
                
                <button 
                  onClick={() => onViewProperty?.(property._id)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all text-sm font-medium"
                >
                  عرض التفاصيل
                </button>
              </div>

              {/* Reviews Summary */}
              {property.totalReviews && property.totalReviews > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      {renderStars(Math.round(property.rating || 0))}
                    </div>
                    <span className="text-gray-500">
                      ({property.totalReviews} تقييم)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
