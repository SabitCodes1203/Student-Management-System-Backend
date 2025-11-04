import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserService,
    private readonly jwt: JwtService,
  ) {}

  async register(payload: RegisterDto) {
    const existing = await this.users.findByEmail(payload.email);
    if (existing) throw new BadRequestException('Email already registered');

    const passwordHash = await bcrypt.hash(payload.password, 10);

    await this.users.create({
      fullName: payload.fullName,
      email: payload.email,
      password: passwordHash,
      mobileNumber: payload.mobileNumber ?? null,
      gender: payload.gender ?? null,
      dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : null,
      isVerified: true,
      verificationCode: null,
      verificationExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    return { message: 'Registration successful.' };
  }

  async login(payload: LoginDto) {
    const user = await this.users.findByEmail(payload.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(payload.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      gender: user.gender || null,
    });

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        gender: user.gender,
      },
    };
  }

  async getProfile(userId: number) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      gender: user.gender,
      mobileNumber: user.mobileNumber,
      dateOfBirth: user.dateOfBirth,
    };
  }
}
