import prisma from '../config/prisma';
import { AppointmentStatus } from '@prisma/client';
import { AppError } from '../middlewares/error.middleware';

export class AppointmentService {
  async getAllAppointments() {
    return prisma.appointment.findMany({
      include: {
        pet: {
          include: {
            owner: true,
          },
        },
        veterinarian: true,
        medicalRecord: true,
        payment: true,
      },
      orderBy: {
        appointmentDate: 'desc',
      },
    });
  }

  async getAppointmentById(id: number) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        pet: {
          include: {
            owner: true,
          },
        },
        veterinarian: true,
        medicalRecord: true,
        payment: true,
      },
    });

    if (!appointment) {
      throw new AppError(`Appointment with ID ${id} not found`, 404);
    }

    return appointment;
  }

  async getAppointmentsByPetId(petId: number) {
    // Verify pet exists
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      throw new AppError(`Pet with ID ${petId} not found`, 404);
    }

    return prisma.appointment.findMany({
      where: { petId },
      include: {
        veterinarian: true,
        medicalRecord: true,
        payment: true,
      },
      orderBy: {
        appointmentDate: 'desc',
      },
    });
  }

  async createAppointment(data: {
    petId: number;
    veterinarianId: number;
    appointmentDate: string | Date;
    reason: string;
    notes?: string;
    status?: AppointmentStatus;
  }) {
    // Verify pet exists
    const pet = await prisma.pet.findUnique({
      where: { id: data.petId },
    });
    if (!pet) {
      throw new AppError(`Cannot create appointment: Pet with ID ${data.petId} not found`, 404);
    }

    // Verify veterinarian exists
    const vet = await prisma.veterinarian.findUnique({
      where: { id: data.veterinarianId },
    });
    if (!vet) {
      throw new AppError(`Cannot create appointment: Veterinarian with ID ${data.veterinarianId} not found`, 404);
    }

    return prisma.appointment.create({
      data: {
        petId: data.petId,
        veterinarianId: data.veterinarianId,
        appointmentDate: new Date(data.appointmentDate),
        reason: data.reason,
        notes: data.notes || null,
        status: data.status || AppointmentStatus.SCHEDULED,
      },
      include: {
        pet: true,
        veterinarian: true,
      },
    });
  }

  async updateAppointment(
    id: number,
    data: {
      petId?: number;
      veterinarianId?: number;
      appointmentDate?: string | Date;
      reason?: string;
      status?: AppointmentStatus;
      notes?: string | null;
    }
  ) {
    await this.getAppointmentById(id);

    if (data.petId) {
      const pet = await prisma.pet.findUnique({ where: { id: data.petId } });
      if (!pet) throw new AppError(`Pet with ID ${data.petId} not found`, 404);
    }

    if (data.veterinarianId) {
      const vet = await prisma.veterinarian.findUnique({ where: { id: data.veterinarianId } });
      if (!vet) throw new AppError(`Veterinarian with ID ${data.veterinarianId} not found`, 404);
    }

    return prisma.appointment.update({
      where: { id },
      data: {
        ...(data.petId && { petId: data.petId }),
        ...(data.veterinarianId && { veterinarianId: data.veterinarianId }),
        ...(data.appointmentDate && { appointmentDate: new Date(data.appointmentDate) }),
        ...(data.reason && { reason: data.reason }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        pet: true,
        veterinarian: true,
        medicalRecord: true,
        payment: true,
      },
    });
  }

  async updateAppointmentStatus(id: number, status: AppointmentStatus) {
    await this.getAppointmentById(id);

    return prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        pet: true,
        veterinarian: true,
      },
    });
  }
}

export const appointmentService = new AppointmentService();
