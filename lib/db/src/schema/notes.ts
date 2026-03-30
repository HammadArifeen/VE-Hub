import { pgTable, varchar, text, boolean, serial } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const notesTable = pgTable("notes", {
  id: serial("id").primaryKey(),
  studentId: varchar("student_id", { length: 64 }).notNull().references(() => usersTable.id),
  mentorId: varchar("mentor_id", { length: 64 }).notNull().references(() => usersTable.id),
  date: varchar("date", { length: 100 }).notNull(),
  text: text("text").notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  isKeyAdvice: boolean("is_key_advice").notNull().default(false),
});

export type Note = typeof notesTable.$inferSelect;
export type InsertNote = typeof notesTable.$inferInsert;
