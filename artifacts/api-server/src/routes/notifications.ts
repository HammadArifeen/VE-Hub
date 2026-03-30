import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// GET /api/notifications
router.get("/notifications", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const rows = await db.select().from(notificationsTable).where(eq(notificationsTable.userId, userId));
  res.json(rows);
});

// POST /api/notifications
router.post("/notifications", requireAuth, async (req, res) => {
  const [created] = await db.insert(notificationsTable).values(req.body).returning();
  res.status(201).json(created);
});

// PATCH /api/notifications/:id — mark as read
router.patch("/notifications/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [updated] = await db.update(notificationsTable).set({ read: true }).where(eq(notificationsTable.id, id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json(updated);
});

// POST /api/notifications/read-all — mark all as read for current user
router.post("/notifications/read-all", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  await db.update(notificationsTable).set({ read: true }).where(eq(notificationsTable.userId, userId));
  res.json({ ok: true });
});

export default router;
