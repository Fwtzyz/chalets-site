interface OwnerRatingDisplayProps {
  ownerId: string;
}

export function OwnerRatingDisplay({ ownerId }: OwnerRatingDisplayProps) {
  // Owner ratings temporarily disabled
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold text-gray-700 mb-2">تقييم المالك</h3>
      <p className="text-sm text-gray-500">نظام التقييم غير متوفر حالياً</p>
    </div>
  );
}
