import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const setupAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    // Check if admin profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      // Update existing profile to admin
      await ctx.db.patch(existingProfile._id, {
        isAdmin: true,
        fullName: "مدير النظام",
        phone: "+966500000000",
        email: "admin@platform.com",
        isVerified: true,
      });
    } else {
      // Create new admin profile
      await ctx.db.insert("userProfiles", {
        userId,
        fullName: "مدير النظام",
        phone: "+966500000000", 
        email: "admin@platform.com",
        isAdmin: true,
        isVerified: true,
      });
    }

    return { success: true, message: "تم إعداد حساب المدير بنجاح" };
  },
});
