import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { ConfigService } from '@nestjs/config';

import * as argon2 from 'argon2';

import { UsersService } from '../users/users.service';

import { SessionsService } from '../sessions/sessions.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { Role } from '../../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,

    private sessionsService: SessionsService,

    private jwtService: JwtService,

    private configService: ConfigService,
  ) {}

  /*
   |--------------------------------------------------------------------------
   | Generate Tokens
   |--------------------------------------------------------------------------
   */
  private async generateTokens(userId: string, email: string, role: string) {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),

      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),

      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /*
   |--------------------------------------------------------------------------
   | Register
   |--------------------------------------------------------------------------
   */
  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await argon2.hash(dto.password);

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: Role.ADMIN,
    });

    return {
      message: 'Register success',

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /*
   |--------------------------------------------------------------------------
   | Login
   |--------------------------------------------------------------------------
   */
  async login(dto: LoginDto, req: any) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await argon2.verify(user.password, dto.password);

    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    const hashedRefreshToken = await argon2.hash(tokens.refreshToken);

    /*
     |--------------------------------------------------------------------------
     | Save Refresh Token
     |--------------------------------------------------------------------------
     */
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    /*
     |--------------------------------------------------------------------------
     | Save Device Session
     |--------------------------------------------------------------------------
     */
    await this.sessionsService.create({
      userId: user.id,

      refreshToken: hashedRefreshToken,

      userAgent: req.headers['user-agent'],

      ipAddress: req.ip,

      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      ...tokens,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /*
   |--------------------------------------------------------------------------
   | Refresh Token
   |--------------------------------------------------------------------------
   */
  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    const hashedRefreshToken = await argon2.hash(tokens.refreshToken);

    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return tokens;
  }

  /*
   |--------------------------------------------------------------------------
   | Logout
   |--------------------------------------------------------------------------
   */
  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);

    await this.sessionsService.revokeAll(userId);

    return {
      message: 'Logout success',
    };
  }
}
