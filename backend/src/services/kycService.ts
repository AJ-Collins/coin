import { prisma } from '../prisma';
import { deleteFile, deleteUserKYCDirectory } from '../utils/fileHandlers';
import { KYCStatus } from '@prisma/client';

export class KYCService {
  static async submitKYC(userId: string, documents: any[]) {
    if (documents.length !== 2) {
      throw new Error('Exactly 2 documents required (ID_FRONT and ID_BACK)');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'USER') {
      throw new Error('Only users with USER role can submit KYC');
    }

    // Delete previous REJECTED/UNVERIFIED submissions if resubmitting
    const previousVerifications = await prisma.kYCVerification.findMany({
      where: { userId, status: { in: ['REJECTED', 'UNVERIFIED'] } },
      include: { documents: true },
    });

    for (const verification of previousVerifications) {
      for (const doc of verification.documents) {
        await deleteFile(doc.fileUrl);
      }
      await prisma.kYCVerification.delete({ where: { id: verification.id } });
    }

    // Create new KYC verification
    const verification = await prisma.kYCVerification.create({
      data: {
        userId,
        status: 'PENDING',
        documents: {
          create: documents.map((doc, idx) => ({
            userId,
            documentType: idx === 0 ? 'ID_FRONT' : 'ID_BACK',
            fileName: doc.filename,
            fileUrl: `${userId}/${doc.filename}`,
            mimeType: doc.mimetype,
          })),
        },
      },
      include: { documents: true },
    });

    return verification;
  }

  static async getKYCStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        kycStatus: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'MARKETER') {
      return {
        role: user.role,
        kycStatus: 'NOT_REQUIRED',
        message: 'Marketer account - no KYC required',
      };
    }

    const verification = await prisma.kYCVerification.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { documents: true },
    });

    return {
      role: user.role,
      kycStatus: user.kycStatus,
      verification,
    };
  }

  static async resubmitKYC(userId: string, documents: any[]) {
    const verification = await prisma.kYCVerification.findFirst({
      where: { userId, status: 'REJECTED' },
      include: { documents: true },
    });

    if (!verification) {
      throw new Error('No rejected KYC submission found to resubmit');
    }

    // Delete old documents
    for (const doc of verification.documents) {
      await deleteFile(doc.fileUrl);
    }

    // Delete old verification
    await prisma.kYCVerification.delete({ where: { id: verification.id } });

    // Create new submission
    return this.submitKYC(userId, documents);
  }

  static async getPendingKYCs(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [verifications, total] = await Promise.all([
      prisma.kYCVerification.findMany({
        where: { status: 'PENDING' },
        include: {
          user: { select: { id: true, email: true, createdAt: true } },
          documents: true,
        },
        orderBy: { submittedAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.kYCVerification.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      verifications,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  static async getKYCSubmissionHistory(userId: string) {
    const verifications = await prisma.kYCVerification.findMany({
      where: { userId },
      include: { documents: true },
      orderBy: { createdAt: 'desc' },
    });

    return verifications;
  }

  static async approveKYC(kycVerificationId: string, adminId: string) {
    const verification = await prisma.kYCVerification.findUnique({
      where: { id: kycVerificationId },
    });

    if (!verification) {
      throw new Error('KYC verification not found');
    }

    const updated = await prisma.kYCVerification.update({
      where: { id: kycVerificationId },
      data: {
        status: 'VERIFIED',
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
    });

    // Update user KYC status
    await prisma.user.update({
      where: { id: verification.userId },
      data: { kycStatus: 'VERIFIED' },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'KYC_APPROVED',
        metadata: JSON.stringify({ kycVerificationId, targetUserId: verification.userId }),
      },
    });

    return updated;
  }

  static async rejectKYC(kycVerificationId: string, adminId: string, reason: string) {
    const verification = await prisma.kYCVerification.findUnique({
      where: { id: kycVerificationId },
      include: { documents: true },
    });

    if (!verification) {
      throw new Error('KYC verification not found');
    }

    const updated = await prisma.kYCVerification.update({
      where: { id: kycVerificationId },
      data: {
        status: 'REJECTED',
        adminNotes: reason,
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
    });

    // Update user KYC status
    await prisma.user.update({
      where: { id: verification.userId },
      data: { kycStatus: 'REJECTED' },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'KYC_REJECTED',
        metadata: JSON.stringify({
          kycVerificationId,
          targetUserId: verification.userId,
          reason,
        }),
      },
    });

    return updated;
  }

  static async deleteKYC(kycVerificationId: string, adminId: string) {
    const verification = await prisma.kYCVerification.findUnique({
      where: { id: kycVerificationId },
      include: { documents: true },
    });

    if (!verification) {
      throw new Error('KYC verification not found');
    }

    // Delete files
    for (const doc of verification.documents) {
      await deleteFile(doc.fileUrl);
    }

    // Delete verification
    await prisma.kYCVerification.delete({ where: { id: kycVerificationId } });

    // Reset user KYC status
    await prisma.user.update({
      where: { id: verification.userId },
      data: { kycStatus: 'UNVERIFIED' },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'KYC_DELETED',
        metadata: JSON.stringify({ kycVerificationId, targetUserId: verification.userId }),
      },
    });

    return { success: true };
  }
}
