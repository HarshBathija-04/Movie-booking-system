// Local dev reads .env; on Render the variables come from the environment.
try {
  process.loadEnvFile();
} catch {
  /* no .env file */
}

const env = process.env;
const isProd = env.NODE_ENV === "production";

const dbSchema = env.DB_SCHEMA || "movie_booking";
if (!/^[a-z_][a-z0-9_]*$/.test(dbSchema)) {
  throw new Error(`DB_SCHEMA "${dbSchema}" must be a lowercase SQL identifier`);
}

if (!env.DATABASE_URL) throw new Error("DATABASE_URL is required");
if (isProd && !env.JWT_SECRET) throw new Error("JWT_SECRET is required in production");

export const config = {
  isProd,
  port: Number(env.PORT || 5126),
  databaseUrl: env.DATABASE_URL,
  dbSchema,
  // Dev-only fallback so local setup works without ceremony; production refuses to boot without one.
  jwtSecret: env.JWT_SECRET || "dev-only-insecure-secret",
  frontendUrls: (env.FRONTEND_URL || "http://localhost:5213")
    .split(",")
    .map((u) => u.trim().replace(/\/$/, ""))
    .filter(Boolean),
  groqApiKey: env.GROQ_API_KEY || "",
};
