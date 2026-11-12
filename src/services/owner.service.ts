import prisma from '../config/prisma';
import { AppError } from '../middlewares/error.middleware';

export class OwnerService {
  async getAllOwners() {
    return prisma.petOwner.findMany({
      include: {
        pets: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async getOwnerById(id: number) {
    const owner = await prisma.petOwner.findUnique({
      where: { id },
      include: {
        pets: true,
      },
    });

    if (!owner) {
      throw new AppError(`Pet owner with ID ${id} not found`, 404);
    }

    return owner;
  }

  async createOwner(data: { fullName: string; phone: string; email: string; address: string }) {
    const existing = await prisma.petOwner.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new AppError(`Pet owner with email '${data.email}' already exists`, 409);
    }

    return prisma.petOwner.create({
      data,
    });
  }

  async updateOwner(
    id: number,
    data: { fullName?: string; phone?: string; email?: string; address?: string }
  ) {
    await this.getOwnerById(id);

    if (data.email) {
      const existing = await prisma.petOwner.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });

      if (existing) {
        throw new AppError(`Pet owner with email '${data.email}' already exists`, 409);
      }
    }

    return prisma.petOwner.update({
      where: { id },
      data,
    });
  }

  async deleteOwner(id: number) {
    await this.getOwnerById(id);

    const petsCount = await prisma.pet.count({
      where: { ownerId: id },
    });

    if (petsCount > 0) {
      throw new AppError(
        `Cannot delete owner with ID ${id} because they have ${petsCount} registered pet(s). Remove or reassign pets first.`,
        400
      );
    }

    return prisma.petOwner.delete({
      where: { id },
    });
  }
}

export const ownerService = new OwnerService();
