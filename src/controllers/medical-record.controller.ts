import { Request, Response, NextFunction } from 'express';
import { medicalRecordService } from '../services/medical-record.service';
import { ApiResponse } from '../types/api-response';

export class MedicalRecordController {
  async getAll(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const records = await medicalRecordService.getAllMedicalRecords();
      res.status(200).json({
        success: true,
        message: 'Medical records retrieved successfully',
        data: records,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const record = await medicalRecordService.getMedicalRecordById(id);
      res.status(200).json({
        success: true,
        message: 'Medical record retrieved successfully',
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByPetId(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const petId = parseInt(req.params.petId, 10);
      const records = await medicalRecordService.getMedicalRecordsByPetId(petId);
      res.status(200).json({
        success: true,
        message: `Medical records for pet ID ${petId} retrieved successfully`,
        data: records,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const record = await medicalRecordService.createMedicalRecord(req.body);
      res.status(201).json({
        success: true,
        message: 'Medical record created successfully',
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const medicalRecordController = new MedicalRecordController();
