const requiredServerVariables = [
  "DATABASE_URL",
  "CLERK_SECRET_KEY",
];

export function validateServerEnvironment() {
  const missing = requiredServerVariables.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

export function isRobloxConfigured() {
  return Boolean(
    process.env.ROBLOX_OPEN_CLOUD_API_KEY &&
      process.env.ROBLOX_UNIVERSE_ID
  );
}