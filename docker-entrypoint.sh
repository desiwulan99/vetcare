#!/bin/sh
set -e

echo "🚀 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Running database seeding..."
npm run prisma:seed || echo "⚠️ Seeding skipped or completed"

echo "✨ Starting VetCare API server..."
exec "$@"
