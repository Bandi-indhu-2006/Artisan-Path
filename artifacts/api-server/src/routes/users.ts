import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { LoginUserBody, LoginUserResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/users/login", async (req, res): Promise<void> => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, phone, city } = parsed.data;

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.phone, phone))
    .limit(1);

  if (existing.length > 0) {
    res.json(LoginUserResponse.parse(existing[0]));
    return;
  }

  const [user] = await db
    .insert(usersTable)
    .values({ name, phone, city })
    .returning();

  res.json(LoginUserResponse.parse(user));
});

export default router;
