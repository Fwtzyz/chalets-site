/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as adminSetup from "../adminSetup.js";
import type * as auth from "../auth.js";
import type * as bookings from "../bookings.js";
import type * as complaints from "../complaints.js";
import type * as conversations from "../conversations.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as ownerRatings from "../ownerRatings.js";
import type * as properties from "../properties.js";
import type * as propertyReviews from "../propertyReviews.js";
import type * as router from "../router.js";
import type * as userProfiles from "../userProfiles.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminSetup: typeof adminSetup;
  auth: typeof auth;
  bookings: typeof bookings;
  complaints: typeof complaints;
  conversations: typeof conversations;
  http: typeof http;
  messages: typeof messages;
  notifications: typeof notifications;
  ownerRatings: typeof ownerRatings;
  properties: typeof properties;
  propertyReviews: typeof propertyReviews;
  router: typeof router;
  userProfiles: typeof userProfiles;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
