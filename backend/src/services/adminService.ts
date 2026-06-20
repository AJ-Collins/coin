import { Passkey } from "@prisma/client";
import { prisma } from "../prisma";

export class AdminService {
  // Passkey
  /**
   * Generates a unique AI-XXX-BOT key.
   * Returns a Promise<Passkey>
   */
  static async generatePasskey(version: string, label: string): Promise<Passkey> {
    const generateAlphanumericWithNumber = (): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 3; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (!/\d/.test(result)) {
        const randomPos = Math.floor(Math.random() * 3);
        const randomNum = Math.floor(Math.random() * 10);
        result = result.substring(0, randomPos) + randomNum + result.substring(randomPos + 1);
      }
      
      return result;
    };

    const code = `AI-${generateAlphanumericWithNumber()}-BOT`;

    try {
      return await prisma.passkey.create({
        data: { code, version, label }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return this.generatePasskey(version, label);
      }
      throw error;
    }
  }

  static async deletePasskey(id: string) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
        throw new Error("Invalid Passkey ID format");
    }
    return await prisma.passkey.delete({ 
        where: { id: numericId }
    });
    }

  static async getAllPasskeys() {
    return prisma.passkey.findMany({ include: { user: true, proBot: true } });
  }

  // Bot Configuration
  static async updateBotConfig(data: { winRate: number; avgWinPct: number; avgLossPct: number; payoutVarPct: number }) {
    return prisma.proBotConfig.upsert({
      where: { id: 1 },
      update: data,
      create: { ...data }
    });
  }

  static async getBotConfig() {
    return prisma.proBotConfig.findFirst() || prisma.proBotConfig.create({ data: {} });
  }
}