import prisma from '../config/prisma';
import { AppError } from '../middlewares/error.middleware';

export class VeterinarianService {
  async getAllVeterinarians() {
    return prisma.veterinarian.findMany({
      include: {
        appointments: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async getVeterinarianById(id: number) {
    const vet = await prisma.veterinarian.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            pet: true,
          },
        },
        medicalRecords: {
          include: {
            pet: true,
          },
        },
      },
    });

    if (!vet) {
      throw new AppError(`Veterinarian with ID ${id} not found`, 404);
    }

    return vet;
  }

  async createVeterinarian(data: {
    fullName: string;
    specialization: string;
    phone: string;
    email: string;
  }) {
    const existing = await prisma.veterinarian.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new AppError(`Veterinarian with email '${data.email}' already exists`, 409);
    }

    return prisma.veterinarian.create({
      data,
    });
  }

  async updateVeterinarian(
    id: number,
    data: { fullName?: string; specialization?: string; phone?: string; email?: string }
  ) {
    await this.getVeterinarianById(id);

    if (data.email) {
      const existing = await prisma.veterinarian.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });

      if (existing) {
        throw new AppError(`Veterinarian with email '${data.email}' already exists`, 409);
      }
    }

    return prisma.veterinarian.update({
      where: { id },
      data,
    });
  }

  async deleteVeterinarian(id: number) {
    await this.getVeterinarianById(id);

    const appointmentsCount = await prisma.appointment.count({
      where: { veterinarianId: id },
    });

    const medicalRecordsCount = await prisma.medicalRecord.count({
      where: { veterinarianId: id },
    });

    if (appointmentsCount > 0 || medicalRecordsCount > 0) {
      throw new AppError(
        `Cannot delete veterinarian with ID ${id} because they have associated operational records (${appointmentsCount} appointment(s), ${medicalRecordsCount} medical record(s)).`,
        400
      );
    }

    return prisma.veterinarian.delete({
      where: { id },
    });
  }
}

export const veterinarianService = new VeterinarianService();
