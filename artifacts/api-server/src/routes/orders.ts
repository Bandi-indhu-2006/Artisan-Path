import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, productsTable } from "@workspace/db";
import {
  PlaceOrderBody,
  ListOrdersQueryParams,
  ListOrdersResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = PlaceOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, parsed.data.productId));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [order] = await db
    .insert(ordersTable)
    .values({
      productId: parsed.data.productId,
      userId: parsed.data.userId,
      productTitle: product.title,
      productImageUrl: product.imageUrl,
      price: parsed.data.price,
      status: "confirmed",
    })
    .returning();

  res.status(201).json({
    ...order,
    createdAt: order.createdAt.toISOString(),
  });
});

router.get("/orders", async (req, res): Promise<void> => {
  const params = ListOrdersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db.select().from(ordersTable).$dynamic();

  if (params.data.userId) {
    query = query.where(eq(ordersTable.userId, params.data.userId));
  }

  const orders = await query.orderBy(ordersTable.createdAt);
  const mapped = orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
  }));

  res.json(ListOrdersResponse.parse(mapped));
});

export default router;
