import { pgTable, text, serial, timestamp, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  artisanId: integer("artisan_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  descriptionHindi: text("description_hindi"),
  descriptionTelugu: text("description_telugu"),
  descriptionTamil: text("description_tamil"),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  imageUrl: text("image_url").notNull(),
  price: real("price").notNull(),
  estimatedPriceMin: real("estimated_price_min").notNull().default(0),
  estimatedPriceMax: real("estimated_price_max").notNull().default(0),
  city: text("city").notNull(),
  averageRating: real("average_rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, averageRating: true, reviewCount: true, verified: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
