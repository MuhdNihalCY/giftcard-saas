import prisma from '../../infrastructure/database';
import { Prisma } from '@prisma/client';

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByIdSelect(id: string, select: Prisma.UserSelect) {
    return prisma.user.findUnique({ where: { id }, select });
  }

  async findActiveById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, isActive: true },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findMany(where: Prisma.UserWhereInput, skip: number, take: number) {
    return prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        businessName: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async count(where: Prisma.UserWhereInput) {
    return prisma.user.count({ where });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}
