import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import { botRoutes } from './routes/botRoutes';
import depositRoutes from './routes/depositRoutes';
import withdrawalRoutes from './routes/withdrawalRoutes';
import webhookRoutes from './routes/webhookRoutes';
import { setupWebSocket } from "./ws";
import { resumeRunningProBots } from "./services/botEngineService";
import { syncExistingAddressesWithAlchemy } from './services/depositService';

dotenv.config();
const app = express();
app.set('trust proxy', 1);
const port = Number(process.env.PORT) || 5000;

app.use(cors({
  origin: [
    "http://localhost:5173",
  ],
  methods: ["GET", "POST", "PUT", 'PATCH', "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", 'Cache-Control', 'Pragma', 'Expires'],
  credentials: true
}) as any);

// Webhook routes MUST be mounted before the global JSON parser, because
// they need the raw request body for Alchemy's HMAC signature verification.
// express.json() inside webhookRoutes (via express.raw()) only works if
// nothing upstream has already consumed the request stream.
app.use('/api/webhooks', webhookRoutes);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/uploads', express.static(path.join(import.meta.dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/deposit', depositRoutes);
app.use('/api/withdraw', withdrawalRoutes);

const server = http.createServer(app);
setupWebSocket(server);

server.listen(port, '0.0.0.0', async () => {
  console.log(`Server running on port: http://localhost:${port}`);
  try {
    await resumeRunningProBots();
    console.log("Operational background bot instances restored successfully.");
  } catch (err) {
    console.error("Critical runtime error while restoring engine background bots:", err);
  }

  if (process.env.ALCHEMY_AUTH_TOKEN) {
    syncExistingAddressesWithAlchemy().catch(err =>
      console.error('Alchemy sync failed:', err.message)
    );
  } else {
    console.warn('⚠ ALCHEMY_AUTH_TOKEN not set — webhook registration disabled');
  }
});