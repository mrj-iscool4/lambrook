import { clerkMiddleware } from "@clerk/nextjs/server";

// Authentication/authorization is enforced at the resources themselves.
// This proxy makes Clerk session state available to those server-side checks.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico|ttf|woff2?|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
