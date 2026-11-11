import pg from "pg";
import { config } from "./env.js";

// Return INTEGER/NUMERIC/BIGINT as JS numbers (counts, ratings, sums are small).
pg.types.setTypeParser(pg.types.builtins.INT8, Number);
pg.types.setTypeParser(pg.types.builtins.NUMERIC, Number);

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  // Every app shares one Render database; each keeps its tables in its own schema.
  options: `-c search_path=${config.dbSchema}`,
  max: 10,
  idleTimeoutMillis: 30_000,
});

pool.on("error", (err) => console.error("Postgres pool error", err.message));

export const query = (text, params) => pool.query(text, params);

/** Run fn(client) inside a transaction; rolls back on any thrown error. */
export const withTransaction = async (fn) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
};
