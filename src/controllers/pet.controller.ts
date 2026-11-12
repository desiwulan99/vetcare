import { Request, Response, NextFunction } from 'express';
import { petService } from '../services/pet.service';
import { ApiResponse } from '../types/api-response';

export class PetController {
  async getAll(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const pets = await petService.getAllPets();
      res.status(200).json({
        success: true,
        message: 'Pets retrieved successfully',
        data: pets,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const pet = await petService.getPetById(id);
      res.status(200).json({
        success: true,
        message: 'Pet retrieved successfully',
        data: pet,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByOwnerId(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const ownerId = parseInt(req.params.ownerId, 10);
      const pets = await petService.getPetsByOwnerId(ownerId);
      res.status(200).json({
        success: true,
        message: `Pets for owner ID ${ownerId} retrieved successfully`,
        data: pets,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const pet = await petService.createPet(req.body);
      res.status(201).json({
        success: true,
        message: 'Pet created successfully',
        data: pet,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await petService.updatePet(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Pet updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      await petService.deletePet(id);
      res.status(200).json({
        success: true,
        message: 'Pet deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const petController = new PetController();
