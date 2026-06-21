// src/routes/webhooks.ts
import { Router } from 'express';
import express from 'express';
import { handleAlchemyWebhook } from '../webhooks/alchemyWebhookHandler';
import { RawBodyRequest } from '../middleware/rawBodyParser';

const router = Router();

router.post(
  '/alchemy',
  express.raw({ type: 'application/json' }),
  (req: RawBodyRequest, res, next) => {
    if (Buffer.isBuffer(req.body)) {
      // Preserve the exact bytes Alchemy signed, BEFORE overwriting req.body.
      req.rawBody = req.body;
      req.body = JSON.parse(req.body.toString('utf8'));
    }
    next();
  },
  handleAlchemyWebhook
);

export default router;