import { Request, Response, NextFunction } from 'express';
import { appointmentService } from '../services/appointment.service';
import { ApiResponse } from '../types/api-response';

export class AppointmentController {
  async getAll(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const appointments = await appointmentService.getAllAppointments();
      res.status(200).json({
        success: true,
        message: 'Appointments retrieved successfully',
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const appointment = await appointmentService.getAppointmentById(id);
      res.status(200).json({
        success: true,
        message: 'Appointment retrieved successfully',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByPetId(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const petId = parseInt(req.params.petId, 10);
      const appointments = await appointmentService.getAppointmentsByPetId(petId);
      res.status(200).json({
        success: true,
        message: `Appointments for pet ID ${petId} retrieved successfully`,
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const appointment = await appointmentService.createAppointment(req.body);
      res.status(201).json({
        success: true,
        message: 'Appointment scheduled successfully',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await appointmentService.updateAppointment(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Appointment updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      const updated = await appointmentService.updateAppointmentStatus(id, status);
      res.status(200).json({
        success: true,
        message: `Appointment status updated to ${status}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const appointmentController = new AppointmentController();
