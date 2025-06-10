import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getProfileByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();
    if (!profile) return null;
    let profilePictureUrl: string | null = null;
    if (profile.profilePicture) {
      profilePictureUrl = await ctx.storage.getUrl(profile.profilePicture);
    }
    return {
      ...profile,
      profilePictureUrl,
    };
  },
});

// Check if current user is admin
export const isCurrentUserAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      console.log("No user ID found");
      return false;
    }
    
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();
    
    console.log("User profile:", profile);
    console.log("Is admin:", profile?.isAdmin || false);
    
    return profile?.isAdmin || false;
  },
});

// Make current user admin (for testing)
export const makeCurrentUserAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول");
    }

    // Check if profile exists
    let profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (profile) {
      // Update existing profile
      await ctx.db.patch(profile._id, {
        isAdmin: true,
      });
    } else {
      // Create new profile with admin rights
      await ctx.db.insert("userProfiles", {
        userId,
        isAdmin: true,
      });
    }

    return { success: true };
  },
});

// Generate upload URL for profile picture
export const generateProfilePictureUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    nationality: v.optional(v.string()),
    profilePicture: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول");
    }

    // Check if profile exists
    let profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    const updateData = {
      ...args,
      userId,
    };

    if (profile) {
      // Update existing profile
      await ctx.db.patch(profile._id, updateData);
    } else {
      // Create new profile
      await ctx.db.insert("userProfiles", updateData);
    }

    return { success: true };
  },
});

// Update profile picture only
export const updateProfilePicture = mutation({
  args: {
    profilePicture: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول");
    }

    // Check if profile exists
    let profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (profile) {
      // Update existing profile
      await ctx.db.patch(profile._id, {
        profilePicture: args.profilePicture,
      });
    } else {
      // Create new profile
      await ctx.db.insert("userProfiles", {
        userId,
        profilePicture: args.profilePicture,
      });
    }

    return { success: true };
  },
});
