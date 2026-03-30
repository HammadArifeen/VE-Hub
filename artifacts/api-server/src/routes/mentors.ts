import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, mentorProfilesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// GET /api/mentors
router.get("/mentors", requireAuth, async (_req, res) => {
  const profiles = await db.select().from(mentorProfilesTable);
  res.json(profiles);
});

// GET /api/mentors/:userId
router.get("/mentors/:userId", requireAuth, async (req, res) => {
  const userId = req.params.userId as string;
  const [profile] = await db.select().from(mentorProfilesTable).where(eq(mentorProfilesTable.userId, userId)).limit(1);
  if (!profile) {
    res.status(404).json({ error: "Mentor profile not found" });
    return;
  }
  res.json(profile);
});

// POST /api/mentors — create/update mentor profile (onboarding)
router.post("/mentors", requireAuth, async (req, res) => {
  const data = req.body;
  const userId = req.user!.userId;

  const [existing] = await db.select().from(mentorProfilesTable).where(eq(mentorProfilesTable.userId, userId)).limit(1);

  if (existing) {
    const [updated] = await db.update(mentorProfilesTable)
      .set({ ...data, userId })
      .where(eq(mentorProfilesTable.userId, userId))
      .returning();
    res.json(updated);
  } else {
    const [created] = await db.insert(mentorProfilesTable)
      .values({ ...data, userId })
      .returning();
    res.status(201).json(created);
  }
});

// PATCH /api/mentors/:userId
router.patch("/mentors/:userId", requireAuth, async (req, res) => {
  const userId = req.params.userId as string;
  const [updated] = await db.update(mentorProfilesTable)
    .set(req.body)
    .where(eq(mentorProfilesTable.userId, userId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Mentor profile not found" });
    return;
  }
  res.json(updated);
});

export default router;
