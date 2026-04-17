import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import artisansRouter from "./artisans";
import productsRouter from "./products";
import coursesRouter from "./courses";
import eventsRouter from "./events";
import chatRouter from "./chat";
import ratingsRouter from "./ratings";
import ordersRouter from "./orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(artisansRouter);
router.use(productsRouter);
router.use(coursesRouter);
router.use(eventsRouter);
router.use(chatRouter);
router.use(ratingsRouter);
router.use(ordersRouter);

export default router;
