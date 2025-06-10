import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create a new booking
export const createBooking = mutation({
  args: {
    propertyId: v.id("properties"),
    checkInDate: v.string(),
    checkOutDate: v.string(),
    guests: v.number(),
    totalPrice: v.number(),
    specialRequests: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    // Get user profile for additional info
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    // Get property details
    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      throw new Error("العقار غير موجود");
    }

    // Check if property is approved
    if (property.status !== "approved") {
      throw new Error("هذا العقار غير متاح للحجز حالياً");
    }

    // Create the booking
    const bookingId = await ctx.db.insert("bookings", {
      propertyId: args.propertyId,
      guestId: userId,
      guestName: userProfile?.fullName,
      guestPhone: userProfile?.phone,
      guestEmail: userProfile?.email,
      checkInDate: args.checkInDate,
      checkOutDate: args.checkOutDate,
      guests: args.guests,
      numberOfGuests: args.guests,
      ownerId: property.ownerId,
      totalPrice: args.totalPrice,
      status: "pending",
      paymentStatus: "pending",
      specialRequests: args.specialRequests,
    });

    // Create notification for property owner
    await ctx.db.insert("notifications", {
      userId: property.ownerId,
      title: "طلب حجز جديد",
      message: `تم استلام طلب حجز جديد لعقارك "${property.title}"`,
      type: "booking_request",
      relatedId: bookingId,
      isRead: false,
    });

    // Create notification for guest
    await ctx.db.insert("notifications", {
      userId: userId,
      title: "تم إرسال طلب الحجز",
      message: `تم إرسال طلب حجزك لـ "${property.title}" بنجاح. سيتم إشعارك عند الرد.`,
      type: "booking",
      relatedId: bookingId,
      isRead: false,
    });

    return bookingId;
  },
});

// Get user's bookings
export const getUserBookings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_guest", (q) => q.eq("guestId", userId))
      .order("desc")
      .collect();

    return bookings;
  },
});

// Get bookings for a property owner
export const getOwnerBookings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const bookings = await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("ownerId"), userId))
      .order("desc")
      .collect();

    return bookings;
  },
});

// Cancel a booking
export const cancelBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    cancellationReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("الحجز غير موجود");
    }

    // Check if user is the guest or owner
    if (booking.guestId !== userId && booking.ownerId !== userId) {
      throw new Error("غير مسموح لك بإلغاء هذا الحجز");
    }

    // Only allow cancellation if booking is pending or confirmed
    if (booking.status !== "pending" && booking.status !== "confirmed") {
      throw new Error("لا يمكن إلغاء هذا الحجز");
    }

    // Update booking status
    await ctx.db.patch(args.bookingId, {
      status: "cancelled",
      cancellationReason: args.cancellationReason,
    });

    // Create notifications
    const property = await ctx.db.get(booking.propertyId);
    
    if (booking.guestId === userId) {
      // Guest cancelled - notify owner
      await ctx.db.insert("notifications", {
        userId: booking.ownerId!,
        title: "تم إلغاء حجز",
        message: `تم إلغاء الحجز لعقارك "${property?.title}"`,
        type: "booking_cancelled",
        relatedId: args.bookingId,
        isRead: false,
      });
    } else {
      // Owner cancelled - notify guest
      await ctx.db.insert("notifications", {
        userId: booking.guestId,
        title: "تم إلغاء حجزك",
        message: `تم إلغاء حجزك لـ "${property?.title}"`,
        type: "booking_cancelled",
        relatedId: args.bookingId,
        isRead: false,
      });
    }

    return { success: true };
  },
});

// Confirm a booking (for property owners)
export const confirmBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    ownerNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("الحجز غير موجود");
    }

    // Check if user is the property owner
    if (booking.ownerId !== userId) {
      throw new Error("غير مسموح لك بتأكيد هذا الحجز");
    }

    // Only allow confirmation if booking is pending
    if (booking.status !== "pending") {
      throw new Error("لا يمكن تأكيد هذا الحجز");
    }

    // Update booking status
    await ctx.db.patch(args.bookingId, {
      status: "confirmed",
      ownerNotes: args.ownerNotes,
    });

    // Create notification for guest
    const property = await ctx.db.get(booking.propertyId);
    await ctx.db.insert("notifications", {
      userId: booking.guestId,
      title: "تم تأكيد حجزك",
      message: `تم تأكيد حجزك لـ "${property?.title}"`,
      type: "booking_confirmed",
      relatedId: args.bookingId,
      isRead: false,
    });

    return { success: true };
  },
});

// Get booking details
export const getBookingDetails = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      return null;
    }

    // Check if user has access to this booking
    if (booking.guestId !== userId && booking.ownerId !== userId) {
      return null;
    }

    // Get property details
    const property = await ctx.db.get(booking.propertyId);

    return {
      ...booking,
      property,
    };
  },
});

// Check availability for a property (simple check)
export const checkAvailability = query({
  args: {
    propertyId: v.id("properties"),
    checkInDate: v.string(),
    checkOutDate: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all confirmed bookings for this property that overlap with the requested dates
    const overlappingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .filter((q) => 
        q.and(
          q.or(
            q.eq(q.field("status"), "confirmed"),
            q.eq(q.field("status"), "pending")
          ),
          q.or(
            // Check if requested check-in is between existing booking dates
            q.and(
              q.lte(q.field("checkInDate"), args.checkInDate),
              q.gt(q.field("checkOutDate"), args.checkInDate)
            ),
            // Check if requested check-out is between existing booking dates
            q.and(
              q.lt(q.field("checkInDate"), args.checkOutDate),
              q.gte(q.field("checkOutDate"), args.checkOutDate)
            ),
            // Check if existing booking is completely within requested dates
            q.and(
              q.gte(q.field("checkInDate"), args.checkInDate),
              q.lte(q.field("checkOutDate"), args.checkOutDate)
            )
          )
        )
      )
      .collect();

    return {
      available: overlappingBookings.length === 0,
      conflictingBookings: overlappingBookings.length,
    };
  },
});
