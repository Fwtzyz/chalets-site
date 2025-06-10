import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function MyPropertiesList({ onViewProperty }: { onViewProperty: (id: Id<"properties">) => void }) {
  const properties = useQuery(api.properties.getUserProperties);

  if (properties === undefined) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">جاري تحميل عقاراتك...</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏠</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          لا توجد عقارات مضافة
        </h3>
        <p className="text-gray-500">
          يمكنك إضافة عقارك الأول الآن!
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">عقاراتي</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property: any) => (
          <div
            key={property._id}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer hover:border-blue-400 transition"
            onClick={() => onViewProperty(property._id)}
          >
            <div className="relative h-40">
              {property.imageUrls && property.imageUrls.length > 0 ? (
                <img
                  src={property.imageUrls[0] || ""}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
                  <span className="text-4xl">🏖️</span>
                </div>
              )}
              <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                {property.propertyType === "chalet"
                  ? "شاليه"
                  : property.propertyType === "villa"
                  ? "فيلا"
                  : property.propertyType === "apartment"
                  ? "شقة"
                  : property.propertyType === "resort"
                  ? "منتجع"
                  : property.propertyType}
              </div>
              <div className="absolute bottom-3 left-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                {property.price.toLocaleString()} ريال/ليلة
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-1">{property.title}</h3>
              <div className="text-gray-600 text-sm mb-2">
                {property.location.district}, {property.location.city}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span>🛏️ {typeof property.capacity === 'object' ? property.capacity.bedrooms : 1}</span>
                <span>🚿 {typeof property.capacity === 'object' ? property.capacity.bathrooms : 1}</span>
                <span>👥 {typeof property.capacity === 'object' ? property.capacity.guests : property.capacity}</span>
              </div>
              <div className="flex items-center gap-2">
                {property.isActive ? (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">نشط</span>
                ) : (
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">غير نشط</span>
                )}
                {property.status && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                    {property.status === "pending"
                      ? "بانتظار الموافقة"
                      : property.status === "approved"
                      ? "معتمد"
                      : property.status === "rejected"
                      ? "مرفوض"
                      : property.status === "suspended"
                      ? "موقوف"
                      : property.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
