import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function connectDB() {
  try {
    await prisma.$connect();
    console.info('✅ Conectado ao banco PostgreSQL!');
  } catch (err) {
    console.error('❌ Erro ao conectar ao banco:', err);
    process.exit(1);
  }
}
