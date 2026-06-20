import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    prisma.user.findUnique({ where: { id: payload.userId } })
      .then(user => {
        if (!user) return res.status(401).json({ error: "User not found" });
        
        req.user = user; 
        req.userId = user.id;
        next();
      })
      .catch((err) => {
        res.status(500).json({ error: "Database error" });
      });
      
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}