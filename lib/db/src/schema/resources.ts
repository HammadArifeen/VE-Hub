import { pgTable, varchar, serial } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const resourcesTable = pgTable("resources", {
  id: serial("id").primaryKey(),
  mentorId: varchar("mentor_id", { length: 64 }).notNull().references(() => usersTable.id),
  title: varchar("title", { length: 500 }).notNull(),
  type: varchar("type", { length: 50 }).notNull().$type<"NOTES" | "VIDEO" | "WORKSHEET">(),
});

export type Resource = typeof resourcesTable.$inferSelect;
export type InsertResource = typeof resourcesTable.$inferInsert;
