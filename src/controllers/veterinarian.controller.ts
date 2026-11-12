import { Request, Response, NextFunction } from 'express';
import { veterinarianService } from '../services/veterinarian.service';
import { ApiResponse } from '../types/api-response';

export class VeterinarianController {
  async getAll(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const vets = await veterinarianService.getAllVeterinarians();
      res.status(200).json({
        success: true,
        message: 'Veterinarians retrieved successfully',
        data: vets,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const vet = await veterinarianService.getVeterinarianById(id);
      res.status(200).json({
        success: true,
        message: 'Veterinarian retrieved successfully',
        data: vet,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const vet = await veterinarianService.createVeterinarian(req.body);
      res.status(201).json({
        success: true,
        message: 'Veterinarian created successfully',
        data: vet,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await veterinarianService.updateVeterinarian(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Veterinarian updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      await veterinarianService.deleteVeterinarian(id);
      res.status(200).json({
        success: true,
        message: 'Veterinarian deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const veterinarianController = new VeterinarianController();
