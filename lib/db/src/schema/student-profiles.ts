import { pgTable, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const studentProfilesTable = pgTable("student_profiles", {
  userId: varchar("user_id", { length: 64 }).primaryKey().references(() => usersTable.id),
  displayName: varchar("display_name", { length: 200 }).notNull(),
  yearGroup: varchar("year_group", { length: 50 }).notNull(),
  mentorId: varchar("mentor_id", { length: 64 }).notNull().references(() => usersTable.id),
  streak: integer("streak").notNull().default(0),
  xp: integer("xp").notNull().default(0),
  maxXp: integer("max_xp").notNull().default(500),
  subjects: jsonb("subjects").notNull().$type<{ name: string; current: number; target: number; history: number[] }[]>(),
  achievements: jsonb("achievements").notNull().$type<{ id: string; title: string; icon: string; unlocked: boolean }[]>(),
  targets: jsonb("targets").notNull().$type<{ shortTerm: string[]; longTerm: string[] }>(),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
});

export type StudentProfile = typeof studentProfilesTable.$inferSelect;
export type InsertStudentProfile = typeof studentProfilesTable.$inferInsert;
