import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, chatMessagesTable } from "@workspace/db";
import {
  ListMessagesQueryParams,
  ListMessagesResponse,
  SendMessageBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/chat/messages", async (req, res): Promise<void> => {
  const params = ListMessagesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const messages = await db
    .select()
    .from(chatMessagesTable)
    .where(
      and(
        eq(chatMessagesTable.artisanId, params.data.artisanId),
        eq(chatMessagesTable.userId, params.data.userId)
      )
    )
    .orderBy(chatMessagesTable.createdAt);

  const mapped = messages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  res.json(ListMessagesResponse.parse(mapped));
});

router.post("/chat/messages", async (req, res): Promise<void> => {
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [message] = await db
    .insert(chatMessagesTable)
    .values(parsed.data)
    .returning();

  res.status(201).json({
    ...message,
    createdAt: message.createdAt.toISOString(),
  });

  if (parsed.data.senderType === "user") {
    setTimeout(async () => {
      await db.insert(chatMessagesTable).values({
        artisanId: parsed.data.artisanId,
        userId: parsed.data.userId,
        senderType: "artisan",
        message: "Thank you for reaching out! Artisan will respond soon.",
      });
    }, 2000);
  }
});

export default router;
