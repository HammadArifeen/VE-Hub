import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, messagesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// GET /api/messages/:conversationKey
router.get("/messages/:conversationKey", requireAuth, async (req, res) => {
  const key = req.params.conversationKey as string;
  const rows = await db.select().from(messagesTable).where(eq(messagesTable.conversationKey, key));
  res.json(rows);
});

// POST /api/messages
router.post("/messages", requireAuth, async (req, res) => {
  const [created] = await db.insert(messagesTable).values(req.body).returning();
  res.status(201).json(created);
});

export default router;
