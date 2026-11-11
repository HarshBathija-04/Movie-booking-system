import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { config } from "../configs/env.js";
import { pool } from "../configs/db.js";

const dir = fileURLToPath(new URL("./migrations/", import.meta.url));

export const migrate = async () => {
  const client = await pool.connect();
  try {
    // Serialise concurrent boots (e.g. two Render instances) on one advisory lock.
    await client.query("SELECT pg_advisory_lock(hashtext($1))", [`migrate:${config.dbSchema}`]);
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${config.dbSchema}"`);
    await client.query(`SET search_path TO "${config.dbSchema}"`);
    await client.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
    );
    const { rows } = await client.query("SELECT name FROM schema_migrations");
    const applied = new Set(rows.map((r) => r.name));

    for (const file of (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort()) {
      if (applied.has(file)) continue;
      const sql = await readFile(dir + file, "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`migrated ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock(hashtext($1))", [`migrate:${config.dbSchema}`]).catch(() => {});
    client.release();
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
