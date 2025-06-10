import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const addProperty = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    price: v.number(),
    location: v.object({
      city: v.string(),
      district: v.string(),
      address: v.optional(v.string()),
    }),
    propertyType: v.union(
      v.literal("chalet"),
      v.literal("villa"),
      v.literal("apartment"),
      v.literal("resort")
    ),
    capacity: v.object({
      guests: v.number(),
      bedrooms: v.number(),
      bathrooms: v.number(),
    }),
    amenities: v.array(v.string()),
    images: v.array(v.id("_storage")),
    imageUrls: v.optional(v.array(v.string())),
    checkInTime: v.optional(v.string()),
    checkOutTime: v.optional(v.string()),
    minimumStay: v.optional(v.number()),
    maximumStay: v.optional(v.number()),
    cancellationPolicy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    // Get user profile for owner information
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("المستخدم غير موجود");
    }

    const propertyId = await ctx.db.insert("properties", {
      title: args.title,
      description: args.description,
      price: args.price,
      location: args.location,
      propertyType: args.propertyType,
      capacity: args.capacity,
      amenities: args.amenities,
      images: args.images,
      imageUrls: args.imageUrls,
      ownerId: userId,
      ownerName: userProfile?.fullName || user.name || "مالك العقار",
      ownerPhone: userProfile?.phone || "",
      status: "pending",
      isActive: true,
      checkInTime: args.checkInTime,
      checkOutTime: args.checkOutTime,
      minimumStay: args.minimumStay,
      maximumStay: args.maximumStay,
      cancellationPolicy: args.cancellationPolicy,
      lastUpdated: Date.now(),
    });

    return propertyId;
  },
});

export const getProperties = query({
  args: {},
  handler: async (ctx) => {
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();

    return properties;
  },
});

export const getMyProperties = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const properties = await ctx.db
      .query("properties")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .order("desc")
      .collect();

    return properties;
  },
});

export const getPropertyById = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    return property;
  },
});

export const updateProperty = mutation({
  args: {
    propertyId: v.id("properties"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    location: v.optional(v.object({
      city: v.string(),
      district: v.string(),
      address: v.optional(v.string()),
    })),
    capacity: v.optional(v.object({
      guests: v.number(),
      bedrooms: v.number(),
      bathrooms: v.number(),
    })),
    amenities: v.optional(v.array(v.string())),
    imageUrls: v.optional(v.array(v.string())),
    checkInTime: v.optional(v.string()),
    checkOutTime: v.optional(v.string()),
    minimumStay: v.optional(v.number()),
    maximumStay: v.optional(v.number()),
    cancellationPolicy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      throw new Error("العقار غير موجود");
    }

    if (property.ownerId !== userId) {
      throw new Error("غير مصرح لك بتعديل هذا العقار");
    }

    const updateData: any = {
      lastUpdated: Date.now(),
    };

    // Only update fields that are provided
    if (args.title !== undefined) updateData.title = args.title;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.price !== undefined) updateData.price = args.price;
    if (args.location !== undefined) updateData.location = args.location;
    if (args.capacity !== undefined) updateData.capacity = args.capacity;
    if (args.amenities !== undefined) updateData.amenities = args.amenities;
    if (args.imageUrls !== undefined) updateData.imageUrls = args.imageUrls;
    if (args.checkInTime !== undefined) updateData.checkInTime = args.checkInTime;
    if (args.checkOutTime !== undefined) updateData.checkOutTime = args.checkOutTime;
    if (args.minimumStay !== undefined) updateData.minimumStay = args.minimumStay;
    if (args.maximumStay !== undefined) updateData.maximumStay = args.maximumStay;
    if (args.cancellationPolicy !== undefined) updateData.cancellationPolicy = args.cancellationPolicy;

    await ctx.db.patch(args.propertyId, updateData);
    return args.propertyId;
  },
});

export const deleteProperty = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      throw new Error("العقار غير موجود");
    }

    if (property.ownerId !== userId) {
      throw new Error("غير مصرح لك بحذف هذا العقار");
    }

    // Check if there are any active bookings
    const activeBookings = await ctx.db
      .query("bookings")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .filter((q) => 
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "confirmed")
        )
      )
      .collect();

    if (activeBookings.length > 0) {
      throw new Error("لا يمكن حذف العقار لوجود حجوزات نشطة");
    }

    await ctx.db.delete(args.propertyId);
    return args.propertyId;
  },
});

export const searchProperties = query({
  args: {
    city: v.optional(v.string()),
    propertyType: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    guests: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("properties")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .filter((q) => q.eq(q.field("isActive"), true));

    if (args.city) {
      query = query.filter((q) => q.eq(q.field("location.city"), args.city));
    }

    if (args.propertyType) {
      query = query.filter((q) => q.eq(q.field("propertyType"), args.propertyType));
    }

    if (args.minPrice !== undefined) {
      query = query.filter((q) => q.gte(q.field("price"), args.minPrice!));
    }

    if (args.maxPrice !== undefined) {
      query = query.filter((q) => q.lte(q.field("price"), args.maxPrice!));
    }

    if (args.guests !== undefined) {
      query = query.filter((q) => {
        return q.gte(q.field("capacity.guests"), args.guests!);
      });
    }

    const properties = await query.order("desc").collect();
    return properties;
  },
});

// Generate upload URL for images
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }
    
    return await ctx.storage.generateUploadUrl();
  },
});

// Get image URL from storage
export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
