import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface EditPropertyProps {
  propertyId: any;
  onBack: () => void;
  onSuccess: () => void;
}

export function EditProperty({ propertyId, onBack, onSuccess }: EditPropertyProps) {
  const property = useQuery(api.properties.getPropertyById, { propertyId });
  const updateProperty = useMutation(api.properties.updateProperty);
  const generateUploadUrl = useMutation(api.properties.generateUploadUrl);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "chalet" as "chalet" | "villa" | "apartment" | "resort",
    price: "",
    location: {
      city: "",
      district: "",
      address: "",
    },
    bedrooms: "",
    bathrooms: "",
    guests: "",
    amenities: [] as string[],
    rules: "",
    checkInTime: "",
    checkOutTime: "",
    cancellationPolicy: "مرن",
  });

  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingImageIds, setExistingImageIds] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title,
        description: property.description,
        propertyType: property.propertyType,
        price: property.price.toString(),
        location: {
          city: property.location.city,
          district: property.location.district,
          address: property.location.address || "",
        },
        bedrooms: typeof property.capacity === 'object' ? property.capacity.bedrooms?.toString() || "" : "1",
        bathrooms: typeof property.capacity === 'object' ? property.capacity.bathrooms?.toString() || "" : "1", 
        guests: typeof property.capacity === 'object' ? property.capacity.guests?.toString() || "" : property.capacity?.toString() || "",
        amenities: property.amenities,
        rules: property.rules ? (Array.isArray(property.rules) ? property.rules.join("\n") : property.rules) : "",
        checkInTime: property.checkInTime || "15:00",
        checkOutTime: property.checkOutTime || "11:00",
        cancellationPolicy: property.cancellationPolicy || "مرن",
      });
      setExistingImages((property.imageUrls?.filter((url): url is string => typeof url === "string" && url !== null) || []) as string[]);
      setExistingImageIds(property.images || []);
    }
  }, [property]);

  const availableAmenities = [
    "مسبح", "شاطئ خاص", "مطبخ مجهز", "واي فاي", "مكيف", "تلفزيون", "غسالة",
    "مجفف", "موقف سيارات", "حديقة", "شواء", "جاكوزي", "ساونا", "صالة ألعاب",
    "ملعب أطفال", "أمن 24 ساعة", "خدمة تنظيف", "خدمة طعام"
  ];

  const cities = [
    "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر",
    "تبوك", "بريدة", "خميس مشيط", "حائل", "الجبيل", "الطائف", "ينبع",
    "أبها", "نجران", "الباحة", "عرعر", "سكاكا", "جازان", "القطيف"
  ];

  const propertyTypes = [
    { value: "chalet", label: "شاليه" },
    { value: "villa", label: "فيلا" },
    { value: "apartment", label: "شقة" },
    { value: "resort", label: "منتجع" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      const totalImages = existingImages.length + images.length + newImages.length;
      if (totalImages > 10) {
        toast.error("يمكن رفع 10 صور كحد أقصى");
        return;
      }
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    setExistingImageIds(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    const uploadedImageIds = [];
    for (const image of images) {
      try {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });
        if (!result.ok) {
          throw new Error("فشل في رفع الصورة");
        }
        const { storageId } = await result.json();
        uploadedImageIds.push(storageId);
      } catch (error) {
        throw new Error("فشل في رفع إحدى الصور");
      }
    }
    return uploadedImageIds;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    if (existingImages.length + images.length === 0) {
      toast.error("يرجى رفع صورة واحدة على الأقل");
      return;
    }
    setIsSubmitting(true);
    try {
      // Upload new images
      const newImageIds = await uploadImages();
      // Combine existing and new image IDs
      const allImageIds = [...existingImageIds, ...newImageIds];
      await updateProperty({
        propertyId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        propertyType: formData.propertyType,
        price: Number(formData.price),
        location: {
          city: formData.location.city,
          district: formData.location.district,
          address: formData.location.address.trim(),
        },
        amenities: formData.amenities,
        images: allImageIds,
        capacity: {
          guests: Number(formData.guests),
          bedrooms: Number(formData.bedrooms),
          bathrooms: Number(formData.bathrooms),
        },
        rules: formData.rules
          ? formData.rules.split("\n").map((r) => r.trim()).filter(Boolean)
          : undefined,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        cancellationPolicy: formData.cancellationPolicy,
      });
      toast.success("تم تحديث العقار بنجاح!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحديث العقار");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!property) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-amber-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">تعديل العقار</h1>
          <button
            type="button"
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
              المعلومات الأساسية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان العقار *
                </label>
                <input
                  type="text"
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="مثال: شاليه فاخر على البحر"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع العقار *
                </label>
                <select
                  required
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف العقار *
              </label>
              <textarea
                required
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="اكتب وصفاً مفصلاً عن العقار..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر (ريال/ليلة) *
              </label>
              <input
                type="number"
                required
                min="1"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="مثال: 500"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
          {/* Location */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
              الموقع
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدينة *
                </label>
                <select
                  required
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">اختر المدينة</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحي *
                </label>
                <input
                  type="text"
                  required
                  name="location.district"
                  value={formData.location.district}
                  onChange={handleInputChange}
                  placeholder="اسم الحي"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان التفصيلي
              </label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleInputChange}
                placeholder="العنوان التفصيلي"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
          {/* Property Details */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
              تفاصيل العقار
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد الغرف *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد الحمامات *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد الأشخاص *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  name="guests"
                  value={formData.guests}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          </div>
          {/* Amenities */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
              المرافق والخدمات
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableAmenities.map(amenity => (
                <label key={amenity} className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Images */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
              صور العقار *
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رفع الصور (حد أقصى 10 صور)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            {(existingImages.length > 0 || images.length > 0) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={'صورة ' + (index + 1)}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={'صورة جديدة ' + (index + 1)}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Rules, Check-in/out, Cancellation */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
              قواعد العقار
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                قواعد العقار (سطر لكل قاعدة)
              </label>
              <textarea
                name="rules"
                rows={3}
                value={formData.rules}
                onChange={handleInputChange}
                placeholder="مثال: يمنع التدخين داخل العقار"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وقت الدخول
                </label>
                <input
                  type="time"
                  name="checkInTime"
                  value={formData.checkInTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وقت الخروج
                </label>
                <input
                  type="time"
                  name="checkOutTime"
                  value={formData.checkOutTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سياسة الإلغاء
                </label>
                <select
                  name="cancellationPolicy"
                  value={formData.cancellationPolicy}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="مرن">مرن</option>
                  <option value="متوسط">متوسط</option>
                  <option value="صارم">صارم</option>
                </select>
              </div>
            </div>
          </div>
          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
