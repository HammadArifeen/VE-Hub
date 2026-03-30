import { pgTable, varchar, text, serial, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationKey: varchar("conversation_key", { length: 200 }).notNull(),
  senderId: varchar("sender_id", { length: 64 }).notNull().references(() => usersTable.id),
  senderName: varchar("sender_name", { length: 200 }).notNull(),
  text: text("text").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export type Message = typeof messagesTable.$inferSelect;
export type InsertMessage = typeof messagesTable.$inferInsert;
