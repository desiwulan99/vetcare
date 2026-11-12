import prisma from '../config/prisma';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { AppError } from '../middlewares/error.middleware';

export class PaymentService {
  async getAllPayments() {
    return prisma.payment.findMany({
      include: {
        appointment: {
          include: {
            pet: {
              include: {
                owner: true,
              },
            },
            veterinarian: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getPaymentById(id: number) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            pet: {
              include: {
                owner: true,
              },
            },
            veterinarian: true,
          },
        },
      },
    });

    if (!payment) {
      throw new AppError(`Payment with ID ${id} not found`, 404);
    }

    return payment;
  }

  async getPaymentsByOwnerId(ownerId: number) {
    const owner = await prisma.petOwner.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new AppError(`Pet owner with ID ${ownerId} not found`, 404);
    }

    return prisma.payment.findMany({
      where: {
        appointment: {
          pet: {
            ownerId,
          },
        },
      },
      include: {
        appointment: {
          include: {
            pet: true,
            veterinarian: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createPayment(data: {
    appointmentId: number;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentStatus?: PaymentStatus;
    paidAt?: string | Date | null;
  }) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      include: { payment: true },
    });

    if (!appointment) {
      throw new AppError(`Appointment with ID ${data.appointmentId} not found`, 404);
    }

    if (appointment.payment) {
      throw new AppError(`Payment for Appointment ID ${data.appointmentId} already exists`, 409);
    }

    const status = data.paymentStatus || PaymentStatus.PENDING;
    const paidAt = data.paidAt
      ? new Date(data.paidAt)
      : status === PaymentStatus.PAID
      ? new Date()
      : null;

    return prisma.payment.create({
      data: {
        appointmentId: data.appointmentId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentStatus: status,
        paidAt,
      },
      include: {
        appointment: {
          include: {
            pet: true,
            veterinarian: true,
          },
        },
      },
    });
  }

  async updatePaymentStatus(id: number, status: PaymentStatus, paidAt?: string | Date | null) {
    await this.getPaymentById(id);

    const resolvedPaidAt =
      paidAt !== undefined
        ? paidAt
          ? new Date(paidAt)
          : null
        : status === PaymentStatus.PAID
        ? new Date()
        : null;

    return prisma.payment.update({
      where: { id },
      data: {
        paymentStatus: status,
        paidAt: resolvedPaidAt,
      },
      include: {
        appointment: {
          include: {
            pet: true,
            veterinarian: true,
          },
        },
      },
    });
  }
}

export const paymentService = new PaymentService();
