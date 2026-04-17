import { pgTable, text, serial, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const artisansTable = pgTable("artisans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  city: text("city").notNull(),
  availableForTeaching: boolean("available_for_teaching").notNull().default(false),
  rating: real("rating").notNull().default(4.5),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertArtisanSchema = createInsertSchema(artisansTable).omit({ id: true, createdAt: true, rating: true, verified: true });
export type InsertArtisan = z.infer<typeof insertArtisanSchema>;
export type Artisan = typeof artisansTable.$inferSelect;
