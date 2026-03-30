import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, resourcesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// GET /api/resources
router.get("/resources", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const rows = await db.select().from(resourcesTable).where(eq(resourcesTable.mentorId, userId));
  res.json(rows);
});

// POST /api/resources
router.post("/resources", requireAuth, async (req, res) => {
  const [created] = await db.insert(resourcesTable).values(req.body).returning();
  res.status(201).json(created);
});

// DELETE /api/resources/:id
router.delete("/resources/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [deleted] = await db.delete(resourcesTable).where(eq(resourcesTable.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }
  res.json({ ok: true });
});

export default router;
