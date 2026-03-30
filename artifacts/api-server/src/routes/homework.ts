import { Router, type IRouter } from "express";
import { eq, or } from "drizzle-orm";
import { db, homeworkTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// GET /api/homework
router.get("/homework", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const rows = await db.select().from(homeworkTable).where(
    or(eq(homeworkTable.studentId, userId), eq(homeworkTable.mentorId, userId))
  );
  res.json(rows);
});

// POST /api/homework
router.post("/homework", requireAuth, async (req, res) => {
  const [created] = await db.insert(homeworkTable).values(req.body).returning();
  res.status(201).json(created);
});

// PATCH /api/homework/:id — update status/grade/feedback
router.patch("/homework/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [updated] = await db.update(homeworkTable).set(req.body).where(eq(homeworkTable.id, id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Homework not found" });
    return;
  }
  res.json(updated);
});

export default router;
