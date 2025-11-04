import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async verifyUser(email: string): Promise<User> {
    return this.prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationExpires: null,
      },
    });
  }

  async updateVerification(
    email: string,
    code: string,
    expiresAt: Date,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { email },
      data: { verificationCode: code, verificationExpires: expiresAt },
    });
  }
}
