// Fresh, migrated and seeded test schema for every run.
export default async () => {
  const { pool } = await import("../configs/db.js");
  const { config } = await import("../configs/env.js");
  const { migrate } = await import("../db/migrate.js");
  const { seed } = await import("../db/seed.js");

  if (!config.dbSchema.endsWith("_test")) throw new Error(`Refusing to reset non-test schema ${config.dbSchema}`);
  await pool.query(`DROP SCHEMA IF EXISTS "${config.dbSchema}" CASCADE`);
  await migrate();
  await seed();
  await pool.end();
};
