import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'VetCare API - Veterinary Clinic Management System',
    version: '1.0.0',
    description:
      'REST API backend for Veterinary Clinic Management System, built with Express, TypeScript, Prisma, PostgreSQL, and Docker Compose.',
    contact: {
      name: 'VetCare API Support',
    },
  },
  servers: [
    {
      url: '/',
      description: 'Current Environment Server',
    },
  ],
  tags: [
    { name: 'System', description: 'System health & information endpoints' },
    { name: 'Pet Owners', description: 'Management of pet owners' },
    { name: 'Pets', description: 'Management of pets and patient records' },
    { name: 'Veterinarians', description: 'Management of clinic veterinarians' },
    { name: 'Appointments', description: 'Consultation and examination scheduling' },
    { name: 'Medical Records', description: 'Animal medical and clinical treatment records' },
    { name: 'Payments', description: 'Billing and payment transactions' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Check API and system health status',
        responses: {
          200: {
            description: 'Application is running healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    uptime: { type: 'number', example: 12.34 },
                    timestamp: { type: 'string', example: '2026-11-12T10:00:00.000Z' },
                    database: { type: 'string', example: 'connected' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/': {
      get: {
        tags: ['System'],
        summary: 'API overview and metadata',
        responses: {
          200: {
            description: 'API information',
          },
        },
      },
    },
    '/api/owners': {
      get: {
        tags: ['Pet Owners'],
        summary: 'Get all pet owners',
        responses: {
          200: { description: 'Pet owners retrieved successfully' },
        },
      },
      post: {
        tags: ['Pet Owners'],
        summary: 'Create a new pet owner',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateOwnerInput' },
            },
          },
        },
        responses: {
          201: { description: 'Pet owner created successfully' },
          409: { description: 'Email already exists' },
        },
      },
    },
    '/api/owners/{id}': {
      get: {
        tags: ['Pet Owners'],
        summary: 'Get pet owner details by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Pet owner details' },
          404: { description: 'Owner not found' },
        },
      },
      put: {
        tags: ['Pet Owners'],
        summary: 'Update pet owner by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateOwnerInput' },
            },
          },
        },
        responses: {
          200: { description: 'Pet owner updated successfully' },
          404: { description: 'Owner not found' },
        },
      },
      delete: {
        tags: ['Pet Owners'],
        summary: 'Delete pet owner by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Pet owner deleted successfully' },
          400: { description: 'Cannot delete owner with registered pets' },
          404: { description: 'Owner not found' },
        },
      },
    },
    '/api/pets': {
      get: {
        tags: ['Pets'],
        summary: 'Get all pets',
        responses: {
          200: { description: 'Pets retrieved successfully' },
        },
      },
      post: {
        tags: ['Pets'],
        summary: 'Register a new pet',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePetInput' },
            },
          },
        },
        responses: {
          201: { description: 'Pet created successfully' },
          404: { description: 'Owner not found' },
        },
      },
    },
    '/api/pets/{id}': {
      get: {
        tags: ['Pets'],
        summary: 'Get pet details by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Pet details' },
          404: { description: 'Pet not found' },
        },
      },
      put: {
        tags: ['Pets'],
        summary: 'Update pet by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePetInput' },
            },
          },
        },
        responses: {
          200: { description: 'Pet updated successfully' },
          404: { description: 'Pet not found' },
        },
      },
      delete: {
        tags: ['Pets'],
        summary: 'Delete pet by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Pet deleted successfully' },
          400: { description: 'Cannot delete pet with associated records' },
          404: { description: 'Pet not found' },
        },
      },
    },
    '/api/pets/owner/{ownerId}': {
      get: {
        tags: ['Pets'],
        summary: 'Get all pets owned by specific owner ID',
        parameters: [{ name: 'ownerId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'List of pets for the owner' },
          404: { description: 'Owner not found' },
        },
      },
    },
    '/api/veterinarians': {
      get: {
        tags: ['Veterinarians'],
        summary: 'Get all veterinarians',
        responses: {
          200: { description: 'Veterinarians retrieved successfully' },
        },
      },
      post: {
        tags: ['Veterinarians'],
        summary: 'Add a new veterinarian',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateVeterinarianInput' },
            },
          },
        },
        responses: {
          201: { description: 'Veterinarian created successfully' },
          409: { description: 'Email already exists' },
        },
      },
    },
    '/api/veterinarians/{id}': {
      get: {
        tags: ['Veterinarians'],
        summary: 'Get veterinarian details by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Veterinarian details' },
          404: { description: 'Veterinarian not found' },
        },
      },
      put: {
        tags: ['Veterinarians'],
        summary: 'Update veterinarian by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateVeterinarianInput' },
            },
          },
        },
        responses: {
          200: { description: 'Veterinarian updated successfully' },
          404: { description: 'Veterinarian not found' },
        },
      },
      delete: {
        tags: ['Veterinarians'],
        summary: 'Delete veterinarian by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Veterinarian deleted successfully' },
          400: { description: 'Cannot delete veterinarian with operational records' },
          404: { description: 'Veterinarian not found' },
        },
      },
    },
    '/api/appointments': {
      get: {
        tags: ['Appointments'],
        summary: 'Get all appointments',
        responses: {
          200: { description: 'Appointments list' },
        },
      },
      post: {
        tags: ['Appointments'],
        summary: 'Create a new appointment',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateAppointmentInput' },
            },
          },
        },
        responses: {
          201: { description: 'Appointment created successfully' },
          404: { description: 'Pet or Veterinarian not found' },
        },
      },
    },
    '/api/appointments/{id}': {
      get: {
        tags: ['Appointments'],
        summary: 'Get appointment details by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Appointment details' },
          404: { description: 'Appointment not found' },
        },
      },
      put: {
        tags: ['Appointments'],
        summary: 'Update appointment by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateAppointmentInput' },
            },
          },
        },
        responses: {
          200: { description: 'Appointment updated successfully' },
          404: { description: 'Appointment not found' },
        },
      },
    },
    '/api/appointments/{id}/status': {
      patch: {
        tags: ['Appointments'],
        summary: 'Update appointment status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
                    example: 'COMPLETED',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status updated successfully' },
          404: { description: 'Appointment not found' },
        },
      },
    },
    '/api/appointments/pet/{petId}': {
      get: {
        tags: ['Appointments'],
        summary: 'Get appointments by pet ID',
        parameters: [{ name: 'petId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Appointments list for pet' },
          404: { description: 'Pet not found' },
        },
      },
    },
    '/api/medical-records': {
      get: {
        tags: ['Medical Records'],
        summary: 'Get all medical records',
        responses: {
          200: { description: 'Medical records list' },
        },
      },
      post: {
        tags: ['Medical Records'],
        summary: 'Create a medical record for an appointment',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMedicalRecordInput' },
            },
          },
        },
        responses: {
          201: { description: 'Medical record created successfully' },
          404: { description: 'Referenced pet, vet, or appointment not found' },
          409: { description: 'Medical record for appointment already exists' },
        },
      },
    },
    '/api/medical-records/{id}': {
      get: {
        tags: ['Medical Records'],
        summary: 'Get medical record details by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Medical record details' },
          404: { description: 'Record not found' },
        },
      },
    },
    '/api/medical-records/pet/{petId}': {
      get: {
        tags: ['Medical Records'],
        summary: 'Get medical records by pet ID',
        parameters: [{ name: 'petId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Medical history for pet' },
          404: { description: 'Pet not found' },
        },
      },
    },
    '/api/payments': {
      get: {
        tags: ['Payments'],
        summary: 'Get all payments',
        responses: {
          200: { description: 'Payments list' },
        },
      },
      post: {
        tags: ['Payments'],
        summary: 'Record a new payment transaction',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePaymentInput' },
            },
          },
        },
        responses: {
          201: { description: 'Payment recorded successfully' },
          404: { description: 'Appointment not found' },
          409: { description: 'Payment for appointment already exists' },
        },
      },
    },
    '/api/payments/{id}': {
      get: {
        tags: ['Payments'],
        summary: 'Get payment details by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Payment details' },
          404: { description: 'Payment not found' },
        },
      },
    },
    '/api/payments/owner/{ownerId}': {
      get: {
        tags: ['Payments'],
        summary: 'Get payment transactions by owner ID',
        parameters: [{ name: 'ownerId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Payments list for owner' },
          404: { description: 'Owner not found' },
        },
      },
    },
    '/api/payments/{id}/status': {
      patch: {
        tags: ['Payments'],
        summary: 'Update payment status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['PENDING', 'PAID', 'CANCELLED'],
                    example: 'PAID',
                  },
                  paidAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2026-11-12T10:00:00Z',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Payment status updated' },
          404: { description: 'Payment not found' },
        },
      },
    },
  },
  components: {
    schemas: {
      CreateOwnerInput: {
        type: 'object',
        required: ['fullName', 'phone', 'email', 'address'],
        properties: {
          fullName: { type: 'string', example: 'Andi Pratama' },
          phone: { type: 'string', example: '081234567890' },
          email: { type: 'string', example: 'andi.pratama@example.com' },
          address: { type: 'string', example: 'Jl. Merdeka No. 10, Jakarta Selatan' },
        },
      },
      UpdateOwnerInput: {
        type: 'object',
        properties: {
          fullName: { type: 'string', example: 'Andi Pratama' },
          phone: { type: 'string', example: '081234567890' },
          email: { type: 'string', example: 'andi.pratama@example.com' },
          address: { type: 'string', example: 'Jl. Merdeka No. 10, Jakarta Selatan' },
        },
      },
      CreatePetInput: {
        type: 'object',
        required: ['name', 'species', 'breed', 'gender', 'dateOfBirth', 'weight', 'ownerId'],
        properties: {
          name: { type: 'string', example: 'Milo' },
          species: { type: 'string', enum: ['CAT', 'DOG', 'RABBIT', 'BIRD', 'OTHER'], example: 'CAT' },
          breed: { type: 'string', example: 'Domestic Shorthair' },
          gender: { type: 'string', example: 'Male' },
          dateOfBirth: { type: 'string', format: 'date', example: '2023-04-10' },
          weight: { type: 'number', example: 4.2 },
          ownerId: { type: 'integer', example: 1 },
        },
      },
      UpdatePetInput: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Milo' },
          species: { type: 'string', enum: ['CAT', 'DOG', 'RABBIT', 'BIRD', 'OTHER'], example: 'CAT' },
          breed: { type: 'string', example: 'Domestic Shorthair' },
          gender: { type: 'string', example: 'Male' },
          dateOfBirth: { type: 'string', format: 'date', example: '2023-04-10' },
          weight: { type: 'number', example: 4.5 },
          ownerId: { type: 'integer', example: 1 },
        },
      },
      CreateVeterinarianInput: {
        type: 'object',
        required: ['fullName', 'specialization', 'phone', 'email'],
        properties: {
          fullName: { type: 'string', example: 'drh. Sarah Wijaya, Sp.KHL' },
          specialization: { type: 'string', example: 'Small Animal Medicine & Surgery' },
          phone: { type: 'string', example: '081122334455' },
          email: { type: 'string', example: 'dr.sarah@vetcare.com' },
        },
      },
      UpdateVeterinarianInput: {
        type: 'object',
        properties: {
          fullName: { type: 'string', example: 'drh. Sarah Wijaya, Sp.KHL' },
          specialization: { type: 'string', example: 'Small Animal Medicine & Surgery' },
          phone: { type: 'string', example: '081122334455' },
          email: { type: 'string', example: 'dr.sarah@vetcare.com' },
        },
      },
      CreateAppointmentInput: {
        type: 'object',
        required: ['petId', 'veterinarianId', 'appointmentDate', 'reason'],
        properties: {
          petId: { type: 'integer', example: 1 },
          veterinarianId: { type: 'integer', example: 1 },
          appointmentDate: { type: 'string', format: 'date-time', example: '2026-11-20T14:30:00Z' },
          reason: { type: 'string', example: 'Vaksinasi tahunan dan pemeriksaan rutin' },
          notes: { type: 'string', example: 'Pasien kooperatif' },
          status: { type: 'string', enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'], example: 'SCHEDULED' },
        },
      },
      UpdateAppointmentInput: {
        type: 'object',
        properties: {
          petId: { type: 'integer', example: 1 },
          veterinarianId: { type: 'integer', example: 1 },
          appointmentDate: { type: 'string', format: 'date-time', example: '2026-11-20T14:30:00Z' },
          reason: { type: 'string', example: 'Vaksinasi tahunan' },
          status: { type: 'string', enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'], example: 'COMPLETED' },
          notes: { type: 'string', example: 'Pemeriksaan selesai' },
        },
      },
      CreateMedicalRecordInput: {
        type: 'object',
        required: ['petId', 'veterinarianId', 'appointmentId', 'diagnosis', 'symptoms', 'treatment', 'prescription'],
        properties: {
          petId: { type: 'integer', example: 1 },
          veterinarianId: { type: 'integer', example: 1 },
          appointmentId: { type: 'integer', example: 1 },
          diagnosis: { type: 'string', example: 'Kondisi fisik prima, bebas parasit' },
          symptoms: { type: 'string', example: 'Pemeriksaan rutin tahunan' },
          treatment: { type: 'string', example: 'Vaksinasi Rabies' },
          prescription: { type: 'string', example: 'Nutri-Plus Gel 1x sehari' },
          notes: { type: 'string', example: 'Jadwalkan booster tahun depan' },
        },
      },
      CreatePaymentInput: {
        type: 'object',
        required: ['appointmentId', 'amount', 'paymentMethod'],
        properties: {
          appointmentId: { type: 'integer', example: 1 },
          amount: { type: 'number', example: 350000 },
          paymentMethod: { type: 'string', enum: ['CASH', 'TRANSFER', 'EWALLET'], example: 'TRANSFER' },
          paymentStatus: { type: 'string', enum: ['PENDING', 'PAID', 'CANCELLED'], example: 'PAID' },
          paidAt: { type: 'string', format: 'date-time', example: '2026-11-01T09:45:00Z' },
        },
      },
    },
  },
};

export const setupSwagger = (app: Application): void => {
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'VetCare API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
    })
  );
};
