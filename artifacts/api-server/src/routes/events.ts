import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, eventsTable, eventBookingsTable } from "@workspace/db";
import {
  ListEventsQueryParams,
  ListEventsResponse,
  BookEventParams,
  BookEventBody,
  BookEventResponse,
  RegisterForEventParams,
  RegisterForEventBody,
  RegisterForEventResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/events", async (req, res): Promise<void> => {
  const params = ListEventsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [];
  if (params.data.city) conditions.push(eq(eventsTable.city, params.data.city));
  if (params.data.category) conditions.push(eq(eventsTable.category, params.data.category));

  let query = db.select().from(eventsTable).$dynamic();
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const events = await query;
  const mapped = events.map((e) => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
  }));

  res.json(ListEventsResponse.parse(mapped));
});

router.post("/events/:id/book", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = BookEventParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const bodyParsed = BookEventBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const [booking] = await db
    .insert(eventBookingsTable)
    .values({
      eventId: params.data.id,
      userId: bodyParsed.data.userId,
      type: "user",
      name: bodyParsed.data.name,
      phone: bodyParsed.data.phone,
    })
    .returning();

  await db
    .update(eventsTable)
    .set({ bookingCount: db.$count(eventBookingsTable, eq(eventBookingsTable.eventId, params.data.id)) as any })
    .where(eq(eventsTable.id, params.data.id));

  res.json(
    BookEventResponse.parse({
      ...booking,
      userId: booking.userId ?? null,
      artisanId: booking.artisanId ?? null,
      createdAt: booking.createdAt.toISOString(),
    })
  );
});

router.post("/events/:id/register", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = RegisterForEventParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const bodyParsed = RegisterForEventBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const [booking] = await db
    .insert(eventBookingsTable)
    .values({
      eventId: params.data.id,
      artisanId: bodyParsed.data.artisanId,
      type: "artisan",
    })
    .returning();

  res.json(
    RegisterForEventResponse.parse({
      ...booking,
      userId: booking.userId ?? null,
      artisanId: booking.artisanId ?? null,
      createdAt: booking.createdAt.toISOString(),
    })
  );
});

export default router;
