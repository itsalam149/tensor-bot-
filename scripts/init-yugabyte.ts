import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

// Load .env.local without external dotenv dependency
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

async function initDb() {
  const url = process.env.YUGABYTE_DATABASE_URL;
  if (!url) {
    console.error("YUGABYTE_DATABASE_URL not found in .env.local");
    process.exit(1);
  }

  console.log("Connecting to YugabyteDB cluster...");
  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    const client = await pool.connect();
    console.log("Successfully connected to YugabyteDB!");

    const sqlPath = path.resolve(process.cwd(), "db/yugabyte-schema.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");

    console.log("Executing schema migrations from db/yugabyte-schema.sql...");
    await client.query(sql);
    console.log("All tables (users, user_sessions, bots, sources, chunks, documents) created successfully!");

    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("Current tables in database:", tables.rows.map(r => r.table_name));
    client.release();
    await pool.end();
    process.exit(0);
  } catch (err: any) {
    console.error("Failed to initialize database:", err.message);
    await pool.end();
    process.exit(1);
  }
}

initDb();
