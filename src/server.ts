import app from './app';
import { ENV } from './config/env';
import prisma from './config/prisma';

const startServer = async () => {
  try {
    // Attempt database connection check
    try {
      await prisma.$connect();
      console.log('Connected to PostgreSQL database via Prisma');
    } catch (dbError) {
      console.warn('Warning: Initial database connection failed. Server will continue and retry on incoming requests.');
    }

    const server = app.listen(ENV.PORT, () => {
      console.log(`VetCare API server running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
      console.log(`Swagger API Documentation available at http://localhost:${ENV.PORT}/docs`);
      console.log(`Health check endpoint available at http://localhost:${ENV.PORT}/health`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Database disconnected. Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

