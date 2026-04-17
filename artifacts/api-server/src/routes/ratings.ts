import { Router, type IRouter } from "express";
import { eq, avg } from "drizzle-orm";
import { db, ratingsTable, productsTable } from "@workspace/db";
import {
  RateProductBody,
  GetProductRatingsParams,
  GetProductRatingsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/ratings", async (req, res): Promise<void> => {
  const parsed = RateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [rating] = await db
    .insert(ratingsTable)
    .values(parsed.data)
    .returning();

  const avgResult = await db
    .select({ avg: avg(ratingsTable.stars) })
    .from(ratingsTable)
    .where(eq(ratingsTable.productId, parsed.data.productId));

  const count = await db
    .select()
    .from(ratingsTable)
    .where(eq(ratingsTable.productId, parsed.data.productId));

  const newAvg = parseFloat(avgResult[0]?.avg ?? "0");

  await db
    .update(productsTable)
    .set({ averageRating: newAvg, reviewCount: count.length })
    .where(eq(productsTable.id, parsed.data.productId));

  res.status(201).json({
    ...rating,
    createdAt: rating.createdAt.toISOString(),
  });
});

router.get("/ratings/product/:productId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const params = GetProductRatingsParams.safeParse({ productId: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const ratings = await db
    .select()
    .from(ratingsTable)
    .where(eq(ratingsTable.productId, params.data.productId))
    .orderBy(ratingsTable.createdAt);

  const mapped = ratings.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(GetProductRatingsResponse.parse(mapped));
});

export default router;
