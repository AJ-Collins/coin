import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const { botId } = req.query;
  const orders = await prisma.order.findMany({
    where: botId ? { botId: Number(botId) } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100
  });
  res.json(orders);
});

export { router as ordersRouter };
