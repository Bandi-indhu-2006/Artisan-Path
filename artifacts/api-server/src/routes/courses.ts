import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, coursesTable, artisansTable } from "@workspace/db";
import {
  ListCoursesQueryParams,
  ListCoursesResponse,
  CreateCourseBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/courses", async (req, res): Promise<void> => {
  const params = ListCoursesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db
    .select({
      id: coursesTable.id,
      artisanId: coursesTable.artisanId,
      artisanName: artisansTable.name,
      artisanCity: artisansTable.city,
      artisanRating: artisansTable.rating,
      title: coursesTable.title,
      description: coursesTable.description,
      category: coursesTable.category,
      subcategory: coursesTable.subcategory,
      durationHours: coursesTable.durationHours,
      price: coursesTable.price,
      imageUrl: coursesTable.imageUrl,
      createdAt: coursesTable.createdAt,
    })
    .from(coursesTable)
    .leftJoin(artisansTable, eq(coursesTable.artisanId, artisansTable.id))
    .$dynamic();

  if (params.data.category) {
    query = query.where(eq(coursesTable.category, params.data.category));
  }

  const courses = await query;
  const mapped = courses.map((c) => ({
    ...c,
    artisanName: c.artisanName ?? "Unknown Artisan",
    artisanCity: c.artisanCity ?? "Unknown",
    artisanRating: c.artisanRating ?? 4.0,
    createdAt: c.createdAt.toISOString(),
  }));

  res.json(ListCoursesResponse.parse(mapped));
});

router.post("/courses", async (req, res): Promise<void> => {
  const parsed = CreateCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [course] = await db
    .insert(coursesTable)
    .values(parsed.data)
    .returning();

  const [artisan] = await db
    .select({ name: artisansTable.name, city: artisansTable.city, rating: artisansTable.rating })
    .from(artisansTable)
    .where(eq(artisansTable.id, parsed.data.artisanId));

  res.status(201).json({
    ...course,
    artisanName: artisan?.name ?? "Unknown",
    artisanCity: artisan?.city ?? "Unknown",
    artisanRating: artisan?.rating ?? 4.0,
    createdAt: course.createdAt.toISOString(),
  });
});

export default router;
