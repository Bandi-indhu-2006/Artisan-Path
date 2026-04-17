import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  artisanId: integer("artisan_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  durationHours: integer("duration_hours").notNull().default(2),
  price: real("price").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({ id: true, createdAt: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;
