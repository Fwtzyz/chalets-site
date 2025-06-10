import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface ImageUploadProps {
  onImagesUploaded: (imageUrls: string[]) => void;
  maxImages?: number;
  existingImages?: string[];
}

export function ImageUpload({ onImagesUploaded, maxImages = 5, existingImages = [] }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedStorageIds, setUploadedStorageIds] = useState<Id<"_storage">[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>(existingImages);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateUploadUrl = useMutation(api.properties.generateUploadUrl);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > maxImages) {
      toast.error(`يمكنك رفع ${maxImages} صور كحد أقصى`);
      return;
    }

    setUploading(true);
    const newStorageIds: Id<"_storage">[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} ليس ملف صورة صالح`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} كبير جداً. الحد الأقصى 5 ميجابايت`);
          continue;
        }

        // Get upload URL
        const uploadUrl = await generateUploadUrl();
        
        // Upload file
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) {
          throw new Error(`فشل في رفع ${file.name}`);
        }

        const { storageId } = await result.json();
        newStorageIds.push(storageId);
      }

      // Store the storage IDs and generate URLs for display
      const allStorageIds = [...uploadedStorageIds, ...newStorageIds];
      setUploadedStorageIds(allStorageIds);
      
      // Generate URLs for the new images for immediate display
      const newImageUrls: string[] = [];
      for (const storageId of newStorageIds) {
        // Use the Convex storage URL format
        const imageUrl = `${import.meta.env.VITE_CONVEX_URL}/api/storage/${storageId}`;
        newImageUrls.push(imageUrl);
      }

      const allImages = [...uploadedImages, ...newImageUrls];
      setUploadedImages(allImages);
      onImagesUploaded(allImages);
      
      if (newImageUrls.length > 0) {
        toast.success(`تم رفع ${newImageUrls.length} صورة بنجاح`);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "فشل في رفع الصور");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    const newStorageIds = uploadedStorageIds.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setUploadedStorageIds(newStorageIds);
    onImagesUploaded(newImages);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          صور العقار (اختياري - حتى {maxImages} صور)
        </label>
        
        {/* Upload Button */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || uploadedImages.length >= maxImages}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                جاري الرفع...
              </>
            ) : (
              <>
                📷 اختر صور
              </>
            )}
          </button>
          
          <span className="text-sm text-gray-500">
            {uploadedImages.length}/{maxImages} صور
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Image Preview */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {uploadedImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`صورة ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  console.error("Image failed to load:", imageUrl);
                  // Fallback to a placeholder or retry logic
                  e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA3NEw5MyA2OEwxMDUgODBMMTE3IDY4TDEyNSA3NlYxMDBIODdWNzRaIiBmaWxsPSIjOUNBM0FGIi8+CjxjaXJjbGUgY3g9Ijg1IiBjeT0iNTgiIHI9IjQiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+";
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        * يمكنك رفع صور بصيغة JPG, PNG, GIF. الحد الأقصى لحجم الصورة 5 ميجابايت
      </p>
    </div>
  );
}
