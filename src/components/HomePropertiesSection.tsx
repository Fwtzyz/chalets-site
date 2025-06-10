import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { EnhancedBookingModal } from "./EnhancedBookingModal";

export function HomePropertiesSection() {
  const properties = useQuery(api.properties.getProperties);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleBookNow = (property: any) => {
    setSelectedProperty(property);
    setShowBookingModal(true);
  };

  const getPropertyImage = (property: any) => {
    // First try imageUrls array
    if (property.imageUrls && property.imageUrls.length > 0) {
      return property.imageUrls[0];
    }
    
    // Then try images array with storage IDs
    if (property.images && property.images.length > 0) {
      return `${import.meta.env.VITE_CONVEX_URL}/api/storage/${property.images[0]}`;
    }
    
    // Fallback to placeholder
    return null;
  };

  const getPropertyCapacity = (property: any) => {
    if (typeof property.capacity === 'number') {
      return property.capacity;
    }
    return property.capacity?.guests || 4;
  };

  return (
    <>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              أحدث العقارات المتاحة
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              اكتشف مجموعة متنوعة من الشاليهات والفلل المميزة في أجمل المواقع السياحية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties?.slice(0, 6).map((property) => {
              const imageUrl = getPropertyImage(property);
              const capacity = getPropertyCapacity(property);
              
              return (
                <div key={property._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="relative h-56">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Image failed to load:", imageUrl);
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback placeholder */}
                    <div className={`w-full h-full bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
                      <span className="text-6xl">🏖️</span>
                    </div>
                    
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                      {property.propertyType === "chalet" ? "شاليه" : 
                       property.propertyType === "villa" ? "فيلا" :
                       property.propertyType === "apartment" ? "شقة" : "منتجع"}
                    </div>
                    
                    <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                      {property.price.toLocaleString()} ريال/ليلة
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{property.title}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <span className="ml-2">📍</span>
                        {property.location.district}, {property.location.city}
                      </div>
                      
                      <div className="flex items-center text-gray-600 text-sm">
                        <span className="ml-2">👥</span>
                        يستوعب حتى {capacity} أشخاص
                      </div>
                      
                      {typeof property.capacity === 'object' && property.capacity?.bedrooms && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <span className="ml-2">🛏️</span>
                          {property.capacity.bedrooms} غرف نوم
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {property.description}
                    </p>
                    
                    <button 
                      onClick={() => handleBookNow(property)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
                    >
                      احجز الآن
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {properties && properties.length > 6 && (
            <div className="text-center mt-12">
              <button className="bg-blue-500 text-white px-8 py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium">
                عرض المزيد من العقارات
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && selectedProperty && (
        <EnhancedBookingModal
          propertyId={selectedProperty._id}
          property={selectedProperty}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedProperty(null);
          }}
          onSuccess={() => {
            setShowBookingModal(false);
            setSelectedProperty(null);
          }}
        />
      )}
    </>
  );
}
