import { auth, clerkClient } from "@clerk/nextjs/server";

export const STAFF_ORGANIZATION_ID =
  "org_3JAF0g2rrpvseJGSTQM7CrUyte1";

export const STAFF_ROLES = [
  "org:staff",
  "org:management",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export async function getStaffAuth() {
  const { userId } = await auth();

  if (!userId) {
    return {
      authenticated: false,
      authorized: false,
      userId: null,
      role: null,
    };
  }

  const client = await clerkClient();

  const { data: memberships } =
    await client.users.getOrganizationMembershipList({
      userId,
      limit: 100,
    });

  const membership = memberships.find(
    (membership) =>
      membership.organization.id === STAFF_ORGANIZATION_ID
  );

  if (!membership) {
    return {
      authenticated: true,
      authorized: false,
      userId,
      role: null,
    };
  }

  const role = STAFF_ROLES.includes(
    membership.role as StaffRole
  )
    ? (membership.role as StaffRole)
    : null;

  return {
    authenticated: true,
    authorized: role !== null,
    userId,
    role,
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
