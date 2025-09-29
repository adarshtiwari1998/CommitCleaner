import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const repositories = pgTable("repositories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull().unique(),
  name: text("name").notNull(),
  owner: text("owner").notNull(),
  status: varchar("status", { enum: ["pending", "scanning", "clean", "needs_cleanup", "processing", "error"] }).notNull().default("pending"),
  lastScanned: timestamp("last_scanned"),
  replitCommitsFound: integer("replit_commits_found"),
  private: boolean("private").notNull().default(false),
});

export const insertRepositorySchema = createInsertSchema(repositories).omit({
  id: true,
});

export type InsertRepository = z.infer<typeof insertRepositorySchema>;
export type Repository = typeof repositories.$inferSelect;
