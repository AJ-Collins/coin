import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
// import tradeRoutes from './routes/tradeRoutes';
import adminRoutes from './routes/adminRoutes';
import { setupWebSocket } from "./ws.js";

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const port = Number(process.env.PORT) || 5000;

app.use(cors({
  origin: [
    "http://localhost:5173",
    // "https://tradenestbinary.com",
    // "https://www.tradenestbinary.com",
    // "https://api.tradenestbinary.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", 'Cache-Control', 'Pragma', 'Expires'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploads directory statically
app.use('/uploads', express.static(path.join(import.meta.dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'TradeNestBinary API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/trades', tradeRoutes);
app.use('/api/admin', adminRoutes);

// HTTP SERVER & SOCKETS
const server = http.createServer(app);
setupWebSocket(server);

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port http://localhost:${port}`);
});