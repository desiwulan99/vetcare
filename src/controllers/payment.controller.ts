import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { ApiResponse } from '../types/api-response';

export class PaymentController {
  async getAll(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const payments = await paymentService.getAllPayments();
      res.status(200).json({
        success: true,
        message: 'Payments retrieved successfully',
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const payment = await paymentService.getPaymentById(id);
      res.status(200).json({
        success: true,
        message: 'Payment retrieved successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByOwnerId(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const ownerId = parseInt(req.params.ownerId, 10);
      const payments = await paymentService.getPaymentsByOwnerId(ownerId);
      res.status(200).json({
        success: true,
        message: `Payments for owner ID ${ownerId} retrieved successfully`,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const payment = await paymentService.createPayment(req.body);
      res.status(201).json({
        success: true,
        message: 'Payment recorded successfully',
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const { status, paidAt } = req.body;
      const updated = await paymentService.updatePaymentStatus(id, status, paidAt);
      res.status(200).json({
        success: true,
        message: `Payment status updated to ${status}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
