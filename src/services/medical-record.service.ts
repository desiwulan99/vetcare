import prisma from '../config/prisma';
import { AppError } from '../middlewares/error.middleware';

export class MedicalRecordService {
  async getAllMedicalRecords() {
    return prisma.medicalRecord.findMany({
      include: {
        pet: {
          include: {
            owner: true,
          },
        },
        veterinarian: true,
        appointment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getMedicalRecordById(id: number) {
    const record = await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        pet: {
          include: {
            owner: true,
          },
        },
        veterinarian: true,
        appointment: true,
      },
    });

    if (!record) {
      throw new AppError(`Medical record with ID ${id} not found`, 404);
    }

    return record;
  }

  async getMedicalRecordsByPetId(petId: number) {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      throw new AppError(`Pet with ID ${petId} not found`, 404);
    }

    return prisma.medicalRecord.findMany({
      where: { petId },
      include: {
        veterinarian: true,
        appointment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createMedicalRecord(data: {
    petId: number;
    veterinarianId: number;
    appointmentId: number;
    diagnosis: string;
    symptoms: string;
    treatment: string;
    prescription: string;
    notes?: string | null;
  }) {
    // 1. Check pet
    const pet = await prisma.pet.findUnique({ where: { id: data.petId } });
    if (!pet) throw new AppError(`Pet with ID ${data.petId} not found`, 404);

    // 2. Check vet
    const vet = await prisma.veterinarian.findUnique({ where: { id: data.veterinarianId } });
    if (!vet) throw new AppError(`Veterinarian with ID ${data.veterinarianId} not found`, 404);

    // 3. Check appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      include: { medicalRecord: true },
    });

    if (!appointment) {
      throw new AppError(`Appointment with ID ${data.appointmentId} not found`, 404);
    }

    if (appointment.medicalRecord) {
      throw new AppError(`Medical record for Appointment ID ${data.appointmentId} already exists`, 409);
    }

    return prisma.medicalRecord.create({
      data: {
        petId: data.petId,
        veterinarianId: data.veterinarianId,
        appointmentId: data.appointmentId,
        diagnosis: data.diagnosis,
        symptoms: data.symptoms,
        treatment: data.treatment,
        prescription: data.prescription,
        notes: data.notes || null,
      },
      include: {
        pet: true,
        veterinarian: true,
        appointment: true,
      },
    });
  }
}

export const medicalRecordService = new MedicalRecordService();
