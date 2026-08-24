import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  // Prevent multiple pool instances in development (Next.js HMR)
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  return new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/photo_vault",
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

// Singleton pool — reuse across HMR cycles in dev
const pool = globalThis._pgPool ?? createPool();
if (process.env.NODE_ENV !== "production") {
  globalThis._pgPool = pool;
}

export const db = drizzle(pool, { schema });
export type Db = typeof db;
