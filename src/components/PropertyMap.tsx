import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface PropertyMapProps {
  onPropertySelect?: (propertyId: string) => void;
  selectedPropertyId?: string | null;
  className?: string;
}

export function PropertyMap({ onPropertySelect, selectedPropertyId, className = "" }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const properties = useQuery(api.properties.getProperties, {});

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Could not get user location:", error);
          // Default to Riyadh, Saudi Arabia
          setUserLocation({ lat: 24.7136, lng: 46.6753 });
        }
      );
    } else {
      // Default to Riyadh, Saudi Arabia
      setUserLocation({ lat: 24.7136, lng: 46.6753 });
    }
  }, []);

  // Initialize map (simplified version without Google Maps API for now)
  useEffect(() => {
    if (!userLocation) return;
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [userLocation]);

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-6 text-center ${className}`}>
        <div className="text-red-600 text-4xl mb-4">🗺️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">خطأ في تحميل الخريطة</h3>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">جاري تحميل الخريطة...</p>
          </div>
        </div>
      )}
      
      {/* Placeholder Map */}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-xl shadow-lg bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">خريطة العقارات</h3>
          <p className="text-gray-600 mb-4">
            اكتشف العقارات القريبة منك على الخريطة
          </p>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <p className="text-sm text-gray-500 mb-2">
              لتفعيل الخريطة، يرجى إضافة مفتاح Google Maps API
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>موقعك</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>عقارات متاحة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Map Controls */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="العودة لموقعي"
        >
          <span>📍</span>
          <span>موقعي</span>
        </button>
        
        <button
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="عرض جميع العقارات"
        >
          <span>🏠</span>
          <span>كل العقارات</span>
        </button>
      </div>

      {/* Properties Count */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{properties?.length || 0}</div>
          <div className="text-xs text-gray-600">عقار متاح</div>
        </div>
      </div>
    </div>
  );
}
