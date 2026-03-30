import { pgTable, varchar, text, serial } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  studentId: varchar("student_id", { length: 64 }).notNull().references(() => usersTable.id),
  mentorId: varchar("mentor_id", { length: 64 }).notNull().references(() => usersTable.id),
  date: varchar("date", { length: 100 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  googleClassroomLink: text("google_classroom_link").notNull().default(""),
  status: varchar("status", { length: 20 }).notNull().$type<"upcoming" | "completed">().default("upcoming"),
});

export type Session = typeof sessionsTable.$inferSelect;
export type InsertSession = typeof sessionsTable.$inferInsert;
