import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { AUTH_COOKIE_NAME } from '../common/utils/cookie.util';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, user } = await this.auth.login(dto);

    const isSecure =
      (this.config.get('APP_COOKIE_SECURE') || 'false') === 'true';
    const cookieName = this.config.get('APP_COOKIE_NAME') || AUTH_COOKIE_NAME;

    res.cookie(cookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isSecure,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { message: 'Login successful', user };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@GetUser() user: any) {
    return this.auth.getProfile(user.id);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    const cookieName = this.config.get('APP_COOKIE_NAME') || AUTH_COOKIE_NAME;
    res.clearCookie(cookieName, { path: '/' });
    return { message: 'Logged out successfully' };
  }
}
