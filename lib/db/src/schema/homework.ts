import { pgTable, varchar, text, serial } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const homeworkTable = pgTable("homework_assignments", {
  id: serial("id").primaryKey(),
  studentId: varchar("student_id", { length: 64 }).notNull().references(() => usersTable.id),
  mentorId: varchar("mentor_id", { length: 64 }).notNull().references(() => usersTable.id),
  title: varchar("title", { length: 500 }).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  dueDate: varchar("due_date", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().$type<"pending" | "submitted" | "graded">().default("pending"),
  grade: varchar("grade", { length: 10 }),
  feedback: text("feedback"),
});

export type HomeworkAssignment = typeof homeworkTable.$inferSelect;
export type InsertHomeworkAssignment = typeof homeworkTable.$inferInsert;
