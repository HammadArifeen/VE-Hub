import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, studentProfilesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// GET /api/students — list all student profiles
router.get("/students", requireAuth, async (_req, res) => {
  const profiles = await db.select().from(studentProfilesTable);
  res.json(profiles);
});

// GET /api/students/:userId
router.get("/students/:userId", requireAuth, async (req, res) => {
  const userId = req.params.userId as string;
  const [profile] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, userId)).limit(1);
  if (!profile) {
    res.status(404).json({ error: "Student profile not found" });
    return;
  }
  res.json(profile);
});

// POST /api/students — create/update student profile (onboarding)
router.post("/students", requireAuth, async (req, res) => {
  const data = req.body;
  const userId = req.user!.userId;

  const [existing] = await db.select().from(studentProfilesTable).where(eq(studentProfilesTable.userId, userId)).limit(1);

  if (existing) {
    const [updated] = await db.update(studentProfilesTable)
      .set({ ...data, userId })
      .where(eq(studentProfilesTable.userId, userId))
      .returning();
    res.json(updated);
  } else {
    const [created] = await db.insert(studentProfilesTable)
      .values({ ...data, userId })
      .returning();
    res.status(201).json(created);
  }
});

// PATCH /api/students/:userId — partial update
router.patch("/students/:userId", requireAuth, async (req, res) => {
  const userId = req.params.userId as string;
  const [updated] = await db.update(studentProfilesTable)
    .set(req.body)
    .where(eq(studentProfilesTable.userId, userId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Student profile not found" });
    return;
  }
  res.json(updated);
});

export default router;
