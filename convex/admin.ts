import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const approveProperty = mutation({
  args: {
    propertyId: v.id("properties"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("يجب تسجيل الدخول");

    // Check if user is admin
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("غير مصرح لك بهذا الإجراء");
    }

    const property = await ctx.db.get(args.propertyId);
    if (!property) throw new Error("العقار غير موجود");

    await ctx.db.patch(args.propertyId, {
      status: "approved",
      isActive: true,
    });

    // Create notification for property owner
    await ctx.db.insert("notifications", {
      userId: property.ownerId,
      title: "تم اعتماد عقارك",
      message: `تم اعتماد عقارك: ${property.title}`,
      type: "property_approved",
      relatedId: args.propertyId,
      isRead: false,
    });

    return args.propertyId;
  },
});

export const rejectProperty = mutation({
  args: {
    propertyId: v.id("properties"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("يجب تسجيل الدخول");

    // Check if user is admin
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("غير مصرح لك بهذا الإجراء");
    }

    const property = await ctx.db.get(args.propertyId);
    if (!property) throw new Error("العقار غير موجود");

    await ctx.db.patch(args.propertyId, {
      status: "rejected",
      isActive: false,
    });

    // Create notification for property owner
    await ctx.db.insert("notifications", {
      userId: property.ownerId,
      title: "تم رفض عقارك",
      message: `تم رفض عقارك: ${property.title}. ${args.reason || ""}`,
      type: "property_rejected",
      relatedId: args.propertyId,
      isRead: false,
    });

    return args.propertyId;
  },
});

export const getPendingProperties = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("يجب تسجيل الدخول");

    // Check if user is admin
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("غير مصرح لك بعرض هذه البيانات");
    }

    const properties = await ctx.db
      .query("properties")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    return properties;
  },
});

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("يجب تسجيل الدخول");

    // Check if user is admin
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("غير مصرح لك بعرض هذه البيانات");
    }

    const properties = await ctx.db.query("properties").collect();
    const bookings = await ctx.db.query("bookings").collect();
    const complaints = await ctx.db.query("complaints").collect();
    const users = await ctx.db.query("userProfiles").collect();

    return {
      properties: {
        total: properties.length,
        pending: properties.filter(p => p.status === "pending").length,
        approved: properties.filter(p => p.status === "approved").length,
        rejected: properties.filter(p => p.status === "rejected").length,
      },
      bookings: {
        total: bookings.length,
        pending: bookings.filter(b => b.status === "pending").length,
        confirmed: bookings.filter(b => b.status === "confirmed").length,
        completed: bookings.filter(b => b.status === "completed").length,
      },
      complaints: {
        total: complaints.length,
        open: complaints.filter(c => c.status === "open").length,
        resolved: complaints.filter(c => c.status === "resolved").length,
      },
      users: {
        total: users.length,
        verified: users.filter(u => u.isVerified).length,
      },
    };
  },
});
