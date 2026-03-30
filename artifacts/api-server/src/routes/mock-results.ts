import { Router, type IRouter } from "express";
import { eq, or } from "drizzle-orm";
import { db, mockExamResultsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// GET /api/mock-results
router.get("/mock-results", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const rows = await db.select().from(mockExamResultsTable).where(
    or(eq(mockExamResultsTable.studentId, userId), eq(mockExamResultsTable.mentorId, userId))
  );
  res.json(rows);
});

// POST /api/mock-results
router.post("/mock-results", requireAuth, async (req, res) => {
  const [created] = await db.insert(mockExamResultsTable).values(req.body).returning();
  res.status(201).json(created);
});

export default router;
