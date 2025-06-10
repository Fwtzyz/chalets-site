interface PropertyRatingDisplayProps {
  propertyId: string;
}

export function PropertyRatingDisplay({ propertyId }: PropertyRatingDisplayProps) {
  // Property ratings temporarily disabled
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold text-gray-700 mb-2">تقييم العقار</h3>
      <p className="text-sm text-gray-500">نظام التقييم غير متوفر حالياً</p>
    </div>
  );
}
