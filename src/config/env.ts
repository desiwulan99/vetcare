import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  POSTGRES_USER: process.env.POSTGRES_USER || 'vetcare_user',
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || 'example_password',
  POSTGRES_DB: process.env.POSTGRES_DB || 'vetcare_db',
};
