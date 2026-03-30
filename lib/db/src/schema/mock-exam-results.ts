import { pgTable, varchar, integer, text, serial } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const mockExamResultsTable = pgTable("mock_exam_results", {
  id: serial("id").primaryKey(),
  studentId: varchar("student_id", { length: 64 }).notNull().references(() => usersTable.id),
  mentorId: varchar("mentor_id", { length: 64 }).notNull().references(() => usersTable.id),
  subject: varchar("subject", { length: 200 }).notNull(),
  score: integer("score").notNull(),
  totalMarks: integer("total_marks").notNull(),
  grade: varchar("grade", { length: 10 }).notNull(),
  date: varchar("date", { length: 100 }).notNull(),
  notes: text("notes").notNull().default(""),
});

export type MockExamResult = typeof mockExamResultsTable.$inferSelect;
export type InsertMockExamResult = typeof mockExamResultsTable.$inferInsert;
