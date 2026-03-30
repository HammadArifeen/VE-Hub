import { Router, type IRouter } from "express";
import { eq, or } from "drizzle-orm";
import { db, sessionsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// GET /api/sessions — get sessions for the current user (as student or mentor)
router.get("/sessions", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const rows = await db.select().from(sessionsTable).where(
    or(eq(sessionsTable.studentId, userId), eq(sessionsTable.mentorId, userId))
  );
  res.json(rows);
});

// POST /api/sessions
router.post("/sessions", requireAuth, async (req, res) => {
  const [created] = await db.insert(sessionsTable).values(req.body).returning();
  res.status(201).json(created);
});

// PATCH /api/sessions/:id
router.patch("/sessions/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [updated] = await db.update(sessionsTable).set(req.body).where(eq(sessionsTable.id, id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  res.json(updated);
});

// DELETE /api/sessions/:id
router.delete("/sessions/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [deleted] = await db.delete(sessionsTable).where(eq(sessionsTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  res.json({ ok: true });
});

export default router;
