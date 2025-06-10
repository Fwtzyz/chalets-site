import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createComplaint = mutation({
  args: {
    subject: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("general"),
      v.literal("property"),
      v.literal("booking"),
      v.literal("payment"),
      v.literal("technical")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    propertyId: v.optional(v.id("properties")),
    bookingId: v.optional(v.id("bookings")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    // Get user profile
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    const complaintId = await ctx.db.insert("complaints", {
      userId,
      userName: userProfile?.fullName || "مستخدم",
      userEmail: userProfile?.email,
      subject: args.subject,
      description: args.description,
      category: args.category,
      priority: args.priority,
      status: "open",
      propertyId: args.propertyId,
      bookingId: args.bookingId,
    });

    // Create notification for admins
    const adminProfiles = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("isAdmin"), true))
      .collect();

    for (const admin of adminProfiles) {
      await ctx.db.insert("notifications", {
        userId: admin.userId,
        title: "شكوى جديدة",
        message: `تم تقديم شكوى جديدة: ${args.subject}`,
        type: "complaint",
        relatedId: complaintId,
        isRead: false,
      });
    }

    return complaintId;
  },
});

export const getUserComplaints = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const complaints = await ctx.db
      .query("complaints")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return complaints;
  },
});

export const getAllComplaints = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    // Check if user is admin
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("غير مصرح لك بعرض هذه البيانات");
    }

    const complaints = await ctx.db
      .query("complaints")
      .order("desc")
      .collect();

    return complaints;
  },
});

export const getComplaintsStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    // Check if user is admin
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("غير مصرح لك بعرض هذه البيانات");
    }

    const complaints = await ctx.db.query("complaints").collect();

    return {
      total: complaints.length,
      byStatus: {
        open: complaints.filter(c => c.status === "open").length,
        in_progress: complaints.filter(c => c.status === "in_progress").length,
        resolved: complaints.filter(c => c.status === "resolved").length,
        closed: complaints.filter(c => c.status === "closed").length,
      },
      byCategory: {
        general: complaints.filter(c => c.category === "general").length,
        property: complaints.filter(c => c.category === "property").length,
        booking: complaints.filter(c => c.category === "booking").length,
        payment: complaints.filter(c => c.category === "payment").length,
        technical: complaints.filter(c => c.category === "technical").length,
      },
      byPriority: {
        low: complaints.filter(c => c.priority === "low").length,
        medium: complaints.filter(c => c.priority === "medium").length,
        high: complaints.filter(c => c.priority === "high").length,
      },
    };
  },
});

export const updateComplaintStatus = mutation({
  args: {
    complaintId: v.id("complaints"),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    ),
    resolution: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    // Check if user is admin
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile?.isAdmin) {
      throw new Error("غير مصرح لك بتعديل الشكاوى");
    }

    const complaint = await ctx.db.get(args.complaintId);
    if (!complaint) {
      throw new Error("الشكوى غير موجودة");
    }

    const updateData: any = {
      status: args.status,
      assignedTo: userId,
    };

    if (args.resolution) {
      updateData.resolution = args.resolution;
      updateData.resolutionDate = Date.now();
    }

    await ctx.db.patch(args.complaintId, updateData);

    // Create notification for complaint owner
    await ctx.db.insert("notifications", {
      userId: complaint.userId,
      title: "تحديث على شكواك",
      message: `تم تحديث حالة شكواك: ${complaint.subject}`,
      type: "complaint",
      relatedId: args.complaintId,
      isRead: false,
    });

    return args.complaintId;
  },
});
