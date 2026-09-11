import { auth } from "@clerk/nextjs/server";

export const STAFF_ORGANIZATION_ID =
  "org_3JAF0g2rrpvseJGSTQM7CrUyte1";

export const STAFF_ROLES = [
  "org:staff",
  "org:management",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export async function getStaffAuth() {
  const { userId, orgId, orgRole, has } = await auth();

  console.log("STAFF AUTH DEBUG:", {
    userId,
    orgId,
    orgRole,
    staffOrganization: STAFF_ORGANIZATION_ID,
    staffRole: has({ role: "org:staff" }),
    managementRole: has({ role: "org:management" }),
  });

  if (!userId) {
    return {
      authenticated: false,
      authorized: false,
      userId: null,
      role: null,
    };
  }

  if (orgId !== STAFF_ORGANIZATION_ID) {
    return {
      authenticated: true,
      authorized: false,
      userId,
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
