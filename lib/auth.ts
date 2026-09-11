import { auth } from "@clerk/nextjs/server";

export const STAFF_ROLES = [
  "org:moderator",
  "org:senior_moderator",
  "org:adminsitrator",
  "org:management",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export async function getStaffAuth() {
  const { userId, has } = await auth();

  if (!userId) {
    return {
      authenticated: false,
      authorized: false,
      userId: null,
      role: null,
    };
  }

  const role = STAFF_ROLES.find((role) => has({ role }));

  return {
    authenticated: true,
    authorized: Boolean(role),
    userId,
    role: role ?? null,
  };
}

export async function requireStaff() {
  const result = await getStaffAuth();

  if (!result.authenticated) {
    throw new Error("UNAUTHENTICATED");
  }

  if (!result.authorized) {
    throw new Error("FORBIDDEN");
  }

  return result;
}