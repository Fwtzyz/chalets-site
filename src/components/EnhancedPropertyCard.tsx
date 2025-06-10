import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface Property {
  _id: Id<"properties">;
  title: string;
  description: string;
  price: number;
  location: {
    city: string;
    district: string;
  };
  propertyType: string;
  amenities: string[];
  imageUrls?: string[];
  capacity: any;
  rating?: number;
  reviewCount?: number;
  status?: string;
  isActive?: boolean;
}

interface PropertyCardProps {
  property: Property;
  onViewDetails: (id: Id<"properties">) => void;
  showActions?: boolean;
}

export function EnhancedPropertyCard({ property, onViewDetails, showActions = false }: PropertyCardProps) {
  const [isBooking, setIsBooking] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const getPropertyTypeLabel = (type: string) => {
    const labels = {
      chalet: "شاليه",
      villa: "فيلا", 
      apartment: "شقة",
      resort: "منتجع"
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + ' ريال/ليلة';
  };

  const getCapacityText = (capacity: any) => {
    if (typeof capacity === 'object') {
      return `${capacity.guests} أشخاص • ${capacity.bedrooms} غرف • ${capacity.bathrooms} حمام`;
    }
    return `${capacity} أشخاص`;
  };

  const getStatusBadge = () => {
    if (!property.status) return null;
    
    const statusConfig = {
      approved: { label: 'مقبول', color: 'bg-green-100 text-green-800' },
      pending: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-800' },
      rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-800' },
      suspended: { label: 'معلق', color: 'bg-orange-100 text-orange-800' },
    };

    const config = statusConfig[property.status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
      {/* Property Image */}
      <div className="relative h-64 overflow-hidden">
        {property.imageUrls && property.imageUrls.length > 0 ? (
          <img
            src={property.imageUrls[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-6xl text-white">🏖️</span>
          </div>
        )}
        
        {/* Status Badge */}
        {getStatusBadge() && (
          <div className="absolute top-4 right-4">
            {getStatusBadge()}
          </div>
        )}

        {/* Property Type Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
            {getPropertyTypeLabel(property.propertyType)}
          </span>
        </div>

        {/* Rating */}
        {property.rating && (
          <div className="absolute bottom-4 left-4">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm font-medium">{property.rating.toFixed(1)}</span>
              {property.reviewCount && (
                <span className="text-xs text-gray-600">({property.reviewCount})</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
            {property.title}
          </h3>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{formatPrice(property.price)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <span className="text-sm">📍</span>
          <span className="text-sm">{property.location.district}, {property.location.city}</span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description}
        </p>

        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <span className="text-sm">👥</span>
          <span className="text-sm">{getCapacityText(property.capacity)}</span>
        </div>

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {property.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                  +{property.amenities.length - 3} المزيد
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onViewDetails(property._id)}
            className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            عرض التفاصيل
          </button>
          
          {showActions && property.status === 'approved' && property.isActive && (
            <button
              onClick={() => setShowBookingModal(true)}
              className="bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              احجز الآن
            </button>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">حجز العقار</h2>
            <p className="text-gray-600 mb-4">
              هل تريد المتابعة لحجز "{property.title}"؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  onViewDetails(property._id);
                }}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                عرض التفاصيل والحجز
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
