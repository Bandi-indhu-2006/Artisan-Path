import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  date: text("date").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  bookingCount: integer("booking_count").notNull().default(0),
  maxCapacity: integer("max_capacity").notNull().default(100),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const eventBookingsTable = pgTable("event_bookings", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id"),
  artisanId: integer("artisan_id"),
  type: text("type").notNull(),
  name: text("name"),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true, bookingCount: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;
export type EventBooking = typeof eventBookingsTable.$inferSelect;
