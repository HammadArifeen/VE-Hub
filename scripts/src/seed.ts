import { scryptSync, randomBytes } from "node:crypto";
import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const USERS = [
  { id: "s1", username: "abduljaleel", password: "student123", name: "Abduljaleel", role: "student", avatar: "AB" },
  { id: "s2", username: "sarah",       password: "student123", name: "Sarah",       role: "student", avatar: "SA" },
  { id: "s3", username: "omar",        password: "student123", name: "Omar",        role: "student", avatar: "OM" },
  { id: "m1", username: "abdelrahman", password: "mentor123",  name: "Abdelrahman", role: "mentor",  avatar: "AR" },
  { id: "m2", username: "fatima",      password: "mentor123",  name: "Fatima",      role: "mentor",  avatar: "FA" },
  { id: "admin1", username: "Musab",   password: "CEO123",     name: "Musab",       role: "admin",   avatar: "MU" },
  { id: "admin2", username: "Hammad",  password: "Admin123",   name: "Hammad",      role: "admin",   avatar: "HA" },
];

async function seed() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });

  try {
    console.log("Seeding users...");

    for (const user of USERS) {
      const hash = hashPassword(user.password);
      await pool.query(
        `INSERT INTO users (id, username, password_hash, name, role, avatar)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           username = EXCLUDED.username,
           password_hash = EXCLUDED.password_hash,
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           avatar = EXCLUDED.avatar`,
        [user.id, user.username, hash, user.name, user.role, user.avatar]
      );
      console.log(`  \u2713 ${user.role}: ${user.username}`);
    }

    console.log("\nSeed complete! Demo credentials:");
    console.log("  Students: abduljaleel/student123, sarah/student123, omar/student123");
    console.log("  Mentors:  abdelrahman/mentor123, fatima/mentor123");
    console.log("  Admins:   Musab/CEO123, Hammad/Admin123");
  } finally {
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
