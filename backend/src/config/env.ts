// backend/src/config/env.ts
if (!process.env.JWT_SECRET) {
  throw new Error("❌ Missing JWT_SECRET in .env");
}

export const ENV = {
  JWT_SECRET: process.env.JWT_SECRET,
  DATABASE_URL: process.env.DATABASE_URL!,
};
