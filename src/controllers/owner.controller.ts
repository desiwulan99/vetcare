import { Request, Response, NextFunction } from 'express';
import { ownerService } from '../services/owner.service';
import { ApiResponse } from '../types/api-response';

export class OwnerController {
  async getAll(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const owners = await ownerService.getAllOwners();
      res.status(200).json({
        success: true,
        message: 'Pet owners retrieved successfully',
        data: owners,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const owner = await ownerService.getOwnerById(id);
      res.status(200).json({
        success: true,
        message: 'Pet owner retrieved successfully',
        data: owner,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const newOwner = await ownerService.createOwner(req.body);
      res.status(201).json({
        success: true,
        message: 'Pet owner created successfully',
        data: newOwner,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await ownerService.updateOwner(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Pet owner updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      await ownerService.deleteOwner(id);
      res.status(200).json({
        success: true,
        message: 'Pet owner deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const ownerController = new OwnerController();
