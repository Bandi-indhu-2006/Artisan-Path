import { Router, type IRouter } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { db, productsTable, artisansTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  ListProductsResponse,
  CreateProductBody,
  GetProductParams,
  GetProductResponse,
  DeleteProductParams,
  GetProductStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const PRICE_FACTORS: Record<string, number> = {
  Hyderabad: 1.1,
  Mumbai: 1.2,
  Delhi: 1.15,
  Jaipur: 1.05,
  Chennai: 1.1,
  Bangalore: 1.12,
};

const CATEGORY_BASE: Record<string, number> = {
  Handloom: 5000,
  Painting: 2000,
  Pottery: 800,
};

function calcPriceRange(price: number, city: string, category: string): { min: number; max: number } {
  const locationFactor = PRICE_FACTORS[city] ?? 1.0;
  const base = CATEGORY_BASE[category] ?? price;
  const trendFactor = 1.1;
  const estimated = base * trendFactor * locationFactor;
  return { min: Math.round(estimated * 0.85), max: Math.round(estimated * 1.15) };
}

router.get("/products/stats", async (_req, res): Promise<void> => {
  const allProducts = await db
    .select({
      id: productsTable.id,
      artisanId: productsTable.artisanId,
      artisanName: artisansTable.name,
      artisanCity: artisansTable.city,
      title: productsTable.title,
      description: productsTable.description,
      descriptionHindi: productsTable.descriptionHindi,
      descriptionTelugu: productsTable.descriptionTelugu,
      descriptionTamil: productsTable.descriptionTamil,
      category: productsTable.category,
      subcategory: productsTable.subcategory,
      imageUrl: productsTable.imageUrl,
      price: productsTable.price,
      estimatedPriceMin: productsTable.estimatedPriceMin,
      estimatedPriceMax: productsTable.estimatedPriceMax,
      city: productsTable.city,
      averageRating: productsTable.averageRating,
      reviewCount: productsTable.reviewCount,
      verified: productsTable.verified,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .leftJoin(artisansTable, eq(productsTable.artisanId, artisansTable.id));

  const topRated = [...allProducts]
    .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
    .slice(0, 4);

  const recentlyAdded = [...allProducts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const byCategory: Record<string, number> = {};
  for (const p of allProducts) {
    byCategory[p.category] = (byCategory[p.category] ?? 0) + 1;
  }

  const mapped = allProducts.map((p) => ({
    ...p,
    artisanName: p.artisanName ?? "Unknown Artisan",
    artisanCity: p.artisanCity ?? p.city,
    descriptionHindi: p.descriptionHindi ?? null,
    descriptionTelugu: p.descriptionTelugu ?? null,
    descriptionTamil: p.descriptionTamil ?? null,
    averageRating: p.averageRating ?? 0,
    reviewCount: p.reviewCount ?? 0,
    createdAt: p.createdAt.toISOString(),
  }));

  res.json(
    GetProductStatsResponse.parse({
      topRated: topRated.map((p) => ({
        ...p,
        artisanName: p.artisanName ?? "Unknown Artisan",
        artisanCity: p.artisanCity ?? p.city,
        descriptionHindi: p.descriptionHindi ?? null,
        descriptionTelugu: p.descriptionTelugu ?? null,
        descriptionTamil: p.descriptionTamil ?? null,
        averageRating: p.averageRating ?? 0,
        reviewCount: p.reviewCount ?? 0,
        createdAt: p.createdAt.toISOString(),
      })),
      recentlyAdded: recentlyAdded.map((p) => ({
        ...p,
        artisanName: p.artisanName ?? "Unknown Artisan",
        artisanCity: p.artisanCity ?? p.city,
        descriptionHindi: p.descriptionHindi ?? null,
        descriptionTelugu: p.descriptionTelugu ?? null,
        descriptionTamil: p.descriptionTamil ?? null,
        averageRating: p.averageRating ?? 0,
        reviewCount: p.reviewCount ?? 0,
        createdAt: p.createdAt.toISOString(),
      })),
      byCategory,
    })
  );
});

router.get("/products", async (req, res): Promise<void> => {
  const params = ListProductsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [];
  if (params.data.category) conditions.push(eq(productsTable.category, params.data.category));
  if (params.data.subcategory) conditions.push(eq(productsTable.subcategory, params.data.subcategory));
  if (params.data.city) conditions.push(eq(productsTable.city, params.data.city));
  if (params.data.artisanId) conditions.push(eq(productsTable.artisanId, params.data.artisanId));

  let query = db
    .select({
      id: productsTable.id,
      artisanId: productsTable.artisanId,
      artisanName: artisansTable.name,
      artisanCity: artisansTable.city,
      title: productsTable.title,
      description: productsTable.description,
      descriptionHindi: productsTable.descriptionHindi,
      descriptionTelugu: productsTable.descriptionTelugu,
      descriptionTamil: productsTable.descriptionTamil,
      category: productsTable.category,
      subcategory: productsTable.subcategory,
      imageUrl: productsTable.imageUrl,
      price: productsTable.price,
      estimatedPriceMin: productsTable.estimatedPriceMin,
      estimatedPriceMax: productsTable.estimatedPriceMax,
      city: productsTable.city,
      averageRating: productsTable.averageRating,
      reviewCount: productsTable.reviewCount,
      verified: productsTable.verified,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .leftJoin(artisansTable, eq(productsTable.artisanId, artisansTable.id))
    .$dynamic();

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const products = await query.orderBy(desc(productsTable.averageRating), desc(productsTable.createdAt));

  const mapped = products.map((p) => ({
    ...p,
    artisanName: p.artisanName ?? "Unknown Artisan",
    artisanCity: p.artisanCity ?? p.city,
    descriptionHindi: p.descriptionHindi ?? null,
    descriptionTelugu: p.descriptionTelugu ?? null,
    descriptionTamil: p.descriptionTamil ?? null,
    averageRating: p.averageRating ?? 0,
    reviewCount: p.reviewCount ?? 0,
    createdAt: p.createdAt.toISOString(),
  }));

  res.json(ListProductsResponse.parse(mapped));
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { artisanId, title, description, category, subcategory, imageUrl, price, city } = parsed.data;
  const { min, max } = calcPriceRange(price, city, category);

  const [product] = await db
    .insert(productsTable)
    .values({
      artisanId,
      title,
      description,
      category,
      subcategory,
      imageUrl,
      price,
      estimatedPriceMin: min,
      estimatedPriceMax: max,
      city,
    })
    .returning();

  const [artisan] = await db
    .select({ name: artisansTable.name, city: artisansTable.city })
    .from(artisansTable)
    .where(eq(artisansTable.id, artisanId));

  res.status(201).json(
    GetProductResponse.parse({
      ...product,
      artisanName: artisan?.name ?? "Unknown",
      artisanCity: artisan?.city ?? city,
      descriptionHindi: product.descriptionHindi ?? null,
      descriptionTelugu: product.descriptionTelugu ?? null,
      descriptionTamil: product.descriptionTamil ?? null,
      averageRating: product.averageRating ?? 0,
      reviewCount: product.reviewCount ?? 0,
      createdAt: product.createdAt.toISOString(),
    })
  );
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetProductParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .select({
      id: productsTable.id,
      artisanId: productsTable.artisanId,
      artisanName: artisansTable.name,
      artisanCity: artisansTable.city,
      title: productsTable.title,
      description: productsTable.description,
      descriptionHindi: productsTable.descriptionHindi,
      descriptionTelugu: productsTable.descriptionTelugu,
      descriptionTamil: productsTable.descriptionTamil,
      category: productsTable.category,
      subcategory: productsTable.subcategory,
      imageUrl: productsTable.imageUrl,
      price: productsTable.price,
      estimatedPriceMin: productsTable.estimatedPriceMin,
      estimatedPriceMax: productsTable.estimatedPriceMax,
      city: productsTable.city,
      averageRating: productsTable.averageRating,
      reviewCount: productsTable.reviewCount,
      verified: productsTable.verified,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .leftJoin(artisansTable, eq(productsTable.artisanId, artisansTable.id))
    .where(eq(productsTable.id, params.data.id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(
    GetProductResponse.parse({
      ...product,
      artisanName: product.artisanName ?? "Unknown Artisan",
      artisanCity: product.artisanCity ?? product.city,
      descriptionHindi: product.descriptionHindi ?? null,
      descriptionTelugu: product.descriptionTelugu ?? null,
      descriptionTamil: product.descriptionTamil ?? null,
      averageRating: product.averageRating ?? 0,
      reviewCount: product.reviewCount ?? 0,
      createdAt: product.createdAt.toISOString(),
    })
  );
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteProductParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
