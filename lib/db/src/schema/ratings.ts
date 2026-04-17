import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ratingsTable = pgTable("ratings", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  userId: integer("user_id").notNull(),
  userName: text("user_name").notNull(),
  stars: integer("stars").notNull(),
  review: text("review").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRatingSchema = createInsertSchema(ratingsTable).omit({ id: true, createdAt: true });
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratingsTable.$inferSelect;
