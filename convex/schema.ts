import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  userProfiles: defineTable({
    userId: v.id("users"),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    nationality: v.optional(v.string()),
    profilePicture: v.optional(v.id("_storage")),
    isAdmin: v.optional(v.boolean()),
    isVerified: v.optional(v.boolean()),
    rating: v.optional(v.number()),
    totalBookings: v.optional(v.number()),
    joinedDate: v.optional(v.number()),
    // Additional fields that might exist in legacy data
    phoneNumber: v.optional(v.string()),
    totalReviews: v.optional(v.number()),
  }).index("by_user_id", ["userId"]),

  properties: defineTable({
    title: v.string(),
    description: v.string(),
    price: v.number(),
    location: v.object({
      city: v.string(),
      district: v.string(),
      address: v.optional(v.string()),
      coordinates: v.optional(v.object({
        lat: v.number(),
        lng: v.number(),
      })),
    }),
    propertyType: v.union(
      v.literal("chalet"),
      v.literal("villa"),
      v.literal("apartment"),
      v.literal("resort")
    ),
    capacity: v.union(
      v.number(),
      v.object({
        guests: v.number(),
        bedrooms: v.number(),
        bathrooms: v.number(),
      })
    ),
    amenities: v.array(v.string()),
    images: v.array(v.id("_storage")),
    imageUrls: v.optional(v.array(v.string())),
    ownerId: v.id("users"),
    ownerName: v.optional(v.string()),
    ownerPhone: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("suspended")
    ),
    isActive: v.optional(v.boolean()),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
    totalBookings: v.optional(v.number()),
    checkInTime: v.optional(v.string()),
    checkOutTime: v.optional(v.string()),
    minimumStay: v.optional(v.number()),
    maximumStay: v.optional(v.number()),
    cancellationPolicy: v.optional(v.string()),
    lastUpdated: v.optional(v.number()),
    // Additional fields that might exist in legacy data
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    priceType: v.optional(v.string()),
    rules: v.optional(v.union(v.string(), v.array(v.string()))),
  })
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"])
    .index("by_city", ["location.city"])
    .index("by_type", ["propertyType"])
    .index("by_price", ["price"]),

  bookings: defineTable({
    propertyId: v.id("properties"),
    guestId: v.id("users"),
    guestName: v.optional(v.string()),
    guestPhone: v.optional(v.string()),
    guestEmail: v.optional(v.string()),
    checkInDate: v.string(),
    checkOutDate: v.string(),
    guests: v.optional(v.number()),
    numberOfGuests: v.optional(v.number()),
    ownerId: v.optional(v.id("users")),
    totalPrice: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("refunded")
    ),
    specialRequests: v.optional(v.string()),
    cancellationReason: v.optional(v.string()),
    notes: v.optional(v.string()),
    ownerNotes: v.optional(v.string()),
    guestNotes: v.optional(v.string()),
  })
    .index("by_property", ["propertyId"])
    .index("by_guest", ["guestId"])
    .index("by_status", ["status"])
    .index("by_dates", ["checkInDate", "checkOutDate"]),

  propertyReviews: defineTable({
    propertyId: v.id("properties"),
    bookingId: v.id("bookings"),
    guestId: v.id("users"),
    guestName: v.string(),
    rating: v.number(),
    comment: v.string(),
    cleanliness: v.number(),
    accuracy: v.number(),
    communication: v.number(),
    location: v.number(),
    value: v.number(),
    isVerified: v.boolean(),
    response: v.optional(v.string()),
    responseDate: v.optional(v.number()),
  })
    .index("by_property", ["propertyId"])
    .index("by_guest", ["guestId"])
    .index("by_booking", ["bookingId"]),

  ownerRatings: defineTable({
    ownerId: v.id("users"),
    bookingId: v.id("bookings"),
    guestId: v.id("users"),
    guestName: v.string(),
    rating: v.number(),
    comment: v.string(),
    communication: v.number(),
    cleanliness: v.number(),
    followsRules: v.number(),
    isVerified: v.boolean(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_guest", ["guestId"])
    .index("by_booking", ["bookingId"]),

  conversations: defineTable({
    participants: v.optional(v.array(v.id("users"))),
    guestId: v.optional(v.id("users")),
    ownerId: v.optional(v.id("users")),
    propertyId: v.optional(v.id("properties")),
    bookingId: v.optional(v.id("bookings")),
    lastMessage: v.optional(v.string()),
    lastMessageTime: v.optional(v.number()),
    lastMessageAt: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_participants", ["participants"])
    .index("by_property", ["propertyId"])
    .index("by_booking", ["bookingId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    senderName: v.optional(v.string()),
    content: v.string(),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("file"),
      v.literal("contact_request")
    ),
    attachments: v.optional(v.array(v.id("_storage"))),
    isRead: v.boolean(),
    readBy: v.optional(v.array(v.id("users"))),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_sender", ["senderId"]),

  complaints: defineTable({
    userId: v.id("users"),
    userName: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    subject: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.string(),
    category: v.union(
      v.literal("general"),
      v.literal("property"),
      v.literal("booking"),
      v.literal("booking_problem"),
      v.literal("payment"),
      v.literal("technical")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    status: v.union(
      v.literal("open"),
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    ),
    propertyId: v.optional(v.id("properties")),
    bookingId: v.optional(v.id("bookings")),
    assignedTo: v.optional(v.id("users")),
    resolution: v.optional(v.string()),
    resolutionDate: v.optional(v.number()),
    attachments: v.optional(v.array(v.id("_storage"))),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_priority", ["priority"])
    .index("by_property", ["propertyId"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("booking"),
      v.literal("booking_request"),
      v.literal("booking_cancelled"),
      v.literal("booking_confirmed"),
      v.literal("payment"),
      v.literal("review"),
      v.literal("message"),
      v.literal("new_message"),
      v.literal("system"),
      v.literal("complaint"),
      v.literal("property_approved"),
      v.literal("property_rejected"),
      v.literal("property_updated"),
      v.literal("admin_message")
    ),
    relatedId: v.optional(v.string()),
    isRead: v.boolean(),
    actionUrl: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_read_status", ["isRead"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
