import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { authRouter } from "./routes/auth.js";
import { botsRouter } from "./routes/bots.js";
import { exchangesRouter } from "./routes/exchanges.js";
import { ordersRouter } from "./routes/orders.js";
import { marketRouter } from "./routes/market.js";
import { paperRouter } from "./routes/paper.js";
import { authenticate } from "./middleware/auth.js";
import { setupWebSocket } from "./ws.js";

dotenv.config();
const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/bots", authenticate, botsRouter);
app.use("/api/exchanges", authenticate, exchangesRouter);
app.use("/api/orders", authenticate, ordersRouter);
app.use("/api/market", authenticate, marketRouter);
app.use("/api/paper", authenticate, paperRouter);
setupWebSocket(server);

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
