import prisma from '../config/prisma';
import { Species } from '@prisma/client';
import { AppError } from '../middlewares/error.middleware';

export class PetService {
  async getAllPets() {
    return prisma.pet.findMany({
      include: {
        owner: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async getPetById(id: number) {
    const pet = await prisma.pet.findUnique({
      where: { id },
      include: {
        owner: true,
        appointments: {
          include: {
            veterinarian: true,
          },
        },
        medicalRecords: {
          include: {
            veterinarian: true,
          },
        },
      },
    });

    if (!pet) {
      throw new AppError(`Pet with ID ${id} not found`, 404);
    }

    return pet;
  }

  async getPetsByOwnerId(ownerId: number) {
    // Verify owner exists
    const owner = await prisma.petOwner.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new AppError(`Pet owner with ID ${ownerId} not found`, 404);
    }

    return prisma.pet.findMany({
      where: { ownerId },
      include: {
        owner: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async createPet(data: {
    name: string;
    species: Species;
    breed: string;
    gender: string;
    dateOfBirth: string | Date;
    weight: number;
    ownerId: number;
  }) {
    // Verify owner exists
    const owner = await prisma.petOwner.findUnique({
      where: { id: data.ownerId },
    });

    if (!owner) {
      throw new AppError(`Cannot create pet: Pet owner with ID ${data.ownerId} does not exist`, 404);
    }

    return prisma.pet.create({
      data: {
        name: data.name,
        species: data.species,
        breed: data.breed,
        gender: data.gender,
        dateOfBirth: new Date(data.dateOfBirth),
        weight: data.weight,
        ownerId: data.ownerId,
      },
      include: {
        owner: true,
      },
    });
  }

  async updatePet(
    id: number,
    data: {
      name?: string;
      species?: Species;
      breed?: string;
      gender?: string;
      dateOfBirth?: string | Date;
      weight?: number;
      ownerId?: number;
    }
  ) {
    await this.getPetById(id);

    if (data.ownerId) {
      const owner = await prisma.petOwner.findUnique({
        where: { id: data.ownerId },
      });
      if (!owner) {
        throw new AppError(`Cannot update pet: Pet owner with ID ${data.ownerId} does not exist`, 404);
      }
    }

    return prisma.pet.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.species && { species: data.species }),
        ...(data.breed && { breed: data.breed }),
        ...(data.gender && { gender: data.gender }),
        ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.ownerId && { ownerId: data.ownerId }),
      },
      include: {
        owner: true,
      },
    });
  }

  async deletePet(id: number) {
    await this.getPetById(id);

    const appointmentsCount = await prisma.appointment.count({
      where: { petId: id },
    });

    const medicalRecordsCount = await prisma.medicalRecord.count({
      where: { petId: id },
    });

    if (appointmentsCount > 0 || medicalRecordsCount > 0) {
      throw new AppError(
        `Cannot delete pet with ID ${id} because it has associated historical records (${appointmentsCount} appointment(s), ${medicalRecordsCount} medical record(s)).`,
        400
      );
    }

    return prisma.pet.delete({
      where: { id },
    });
  }
}

export const petService = new PetService();
