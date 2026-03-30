import { pgTable, varchar, boolean, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const mentorProfilesTable = pgTable("mentor_profiles", {
  userId: varchar("user_id", { length: 64 }).primaryKey().references(() => usersTable.id),
  displayName: varchar("display_name", { length: 200 }).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  studentNames: jsonb("student_names").notNull().$type<{ name: string; yearGroup: string; id: string }[]>(),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
});

export type MentorProfile = typeof mentorProfilesTable.$inferSelect;
export type InsertMentorProfile = typeof mentorProfilesTable.$inferInsert;
