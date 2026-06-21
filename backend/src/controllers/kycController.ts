import { Request, Response } from 'express';
import { KYCService } from '../services/kycService';

export class KYCController {
  static async submitKYC(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      if (files.length !== 2) {
        return res.status(400).json({ error: 'Exactly 2 documents required (ID_FRONT and ID_BACK)' });
      }

      const verification = await KYCService.submitKYC(userId, files);
      res.json({
        success: true,
        verificationId: verification.id,
        status: verification.status,
        message: 'KYC submitted. Awaiting verification.',
      });
    } catch (err: any) {
      console.error('submitKYC error:', err);
      if (err.message.includes('file')) {
        return res.status(413).json({ error: err.message });
      }
      res.status(400).json({ error: err.message });
    }
  }

  static async getKYCStatus(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const status = await KYCService.getKYCStatus(userId);
      res.json(status);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async resubmitKYC(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length !== 2) {
        return res.status(400).json({ error: 'Exactly 2 documents required' });
      }

      const verification = await KYCService.resubmitKYC(userId, files);
      res.json({
        success: true,
        verificationId: verification.id,
        status: verification.status,
        message: 'KYC resubmitted. Awaiting verification.',
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async getKYCSubmissionHistory(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const history = await KYCService.getKYCSubmissionHistory(userId);
      res.json({
        count: history.length,
        submissions: history.map(v => ({
          id: v.id,
          status: v.status,
          submittedAt: v.submittedAt,
          reviewedAt: v.reviewedAt,
          adminNotes: v.adminNotes,
          documents: v.documents.map(d => ({
            id: d.id,
            type: d.documentType,
            fileName: d.fileName,
            uploadedAt: d.uploadedAt,
          })),
        })),
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}

export const AdminKYCController = {
  async getPendingKYCs(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await KYCService.getPendingKYCs(page, limit);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async approveKYC(req: Request, res: Response) {
    try {
      const { kycVerificationId } = req.params;
      const adminId = req.user!.id;

      if (!kycVerificationId) {
        return res.status(400).json({ error: 'KYC verification ID required' });
      }

      const result = await KYCService.approveKYC(kycVerificationId, adminId);
      res.json({
        success: true,
        message: 'KYC verification approved',
        verification: result,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async rejectKYC(req: Request, res: Response) {
    try {
      const { kycVerificationId } = req.params;
      const { reason } = req.body;
      const adminId = req.user!.id;

      if (!kycVerificationId || !reason) {
        return res.status(400).json({ error: 'KYC verification ID and rejection reason required' });
      }

      const result = await KYCService.rejectKYC(kycVerificationId, adminId, reason);
      res.json({
        success: true,
        message: 'KYC verification rejected',
        verification: result,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async deleteKYC(req: Request, res: Response) {
    try {
      const { kycVerificationId } = req.params;
      const adminId = req.user!.id;

      if (!kycVerificationId) {
        return res.status(400).json({ error: 'KYC verification ID required' });
      }

      await KYCService.deleteKYC(kycVerificationId, adminId);
      res.json({
        success: true,
        message: 'KYC verification deleted',
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
};
