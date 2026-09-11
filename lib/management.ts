import { auth } from "@clerk/nextjs/server";

export async function requireManagement() {
  const { userId, has } = await auth();

  if (!userId) {
    throw new Error("UNAUTHENTICATED");
  }

  if (!has({ role: "org:management" })) {
    throw new Error("FORBIDDEN");
  }

  return {
    userId,
  };
}