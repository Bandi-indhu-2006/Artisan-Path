import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, artisansTable } from "@workspace/db";
import {
  LoginArtisanBody,
  LoginArtisanResponse,
  ListArtisansQueryParams,
  ListArtisansResponse,
  GetArtisanParams,
  GetArtisanResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/artisans/login", async (req, res): Promise<void> => {
  const parsed = LoginArtisanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, category, subcategory, city, availableForTeaching } = parsed.data;

  const existing = await db
    .select()
    .from(artisansTable)
    .where(and(eq(artisansTable.name, name), eq(artisansTable.city, city)))
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(artisansTable)
      .set({ availableForTeaching, subcategory: subcategory ?? null })
      .where(eq(artisansTable.id, existing[0].id))
      .returning();
    res.json(LoginArtisanResponse.parse(updated));
    return;
  }

  const [artisan] = await db
    .insert(artisansTable)
    .values({ name, category, subcategory: subcategory ?? null, city, availableForTeaching })
    .returning();

  res.json(LoginArtisanResponse.parse(artisan));
});

router.get("/artisans", async (req, res): Promise<void> => {
  const params = ListArtisansQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db.select().from(artisansTable).$dynamic();
  const conditions = [];

  if (params.data.city) {
    conditions.push(eq(artisansTable.city, params.data.city));
  }
  if (params.data.category) {
    conditions.push(eq(artisansTable.category, params.data.category));
  }
  if (params.data.teachingOnly) {
    conditions.push(eq(artisansTable.availableForTeaching, true));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const artisans = await query;
  res.json(ListArtisansResponse.parse(artisans));
});

router.get("/artisans/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetArtisanParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [artisan] = await db
    .select()
    .from(artisansTable)
    .where(eq(artisansTable.id, params.data.id));

  if (!artisan) {
    res.status(404).json({ error: "Artisan not found" });
    return;
  }

  res.json(GetArtisanResponse.parse(artisan));
});

export default router;
