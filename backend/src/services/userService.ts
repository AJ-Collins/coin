import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { RegisterInput, LoginInput, AuthResponse, UserDTO } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Critical Configuration Error: JWT_SECRET environment variable is missing.');
}

// 1. Define compile-time safe database return shapes using Prisma's type utilities
type DBUserWithRelations = Prisma.UserGetPayload<{
  include: { accounts: true };
}>;

/**
 * Data Transfer Object (DTO) to sanitize and transform database payloads 
 * securely before transmitting data to the client application layer.
 */
function toUserDTO(user: DBUserWithRelations): UserDTO {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    referralRate: Number(user.referralRate),
    kycStatus: user.kycStatus,
    idDocument: user.idDocument ?? null,
    createdAt: user.createdAt,
    accounts: (user.accounts ?? []).map((acc) => ({
      id: acc.id,
      type: acc.type,
      balance: Number(acc.balance),
      currency: acc.currency,
      createdAt: acc.createdAt,
    })),
  };
}

export class UserService {
  
  
}