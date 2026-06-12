import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const accounts = await prisma.exchangeAccount.findMany();
  res.json(accounts.map(a => ({ ...a, secretKey: "***" })));
});

router.post("/", async (req, res) => {
  const { name, exchange, apiKey, secretKey, isPaper } = req.body;
  const account = await prisma.exchangeAccount.create({ data: { name, exchange, apiKey, secretKey, isPaper: !!isPaper } });
  res.json({ ...account, secretKey: "***" });
});

router.delete("/:id", async (req, res) => {
  await prisma.exchangeAccount.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

export { router as exchangesRouter };
