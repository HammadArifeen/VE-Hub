import { Router, type IRouter } from "express";
import { eq, or } from "drizzle-orm";
import { db, notesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// GET /api/notes
router.get("/notes", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const rows = await db.select().from(notesTable).where(
    or(eq(notesTable.studentId, userId), eq(notesTable.mentorId, userId))
  );
  res.json(rows);
});

// POST /api/notes
router.post("/notes", requireAuth, async (req, res) => {
  const [created] = await db.insert(notesTable).values(req.body).returning();
  res.status(201).json(created);
});

// DELETE /api/notes/:id
router.delete("/notes/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [deleted] = await db.delete(notesTable).where(eq(notesTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Note not found" });
    return;
  }
  res.json({ ok: true });
});

export default router;
