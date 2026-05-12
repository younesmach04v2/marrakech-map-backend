import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { JwtUserPayload } from './auth.types';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username?: string; password?: string }): Promise<{ accessToken: string; user: { id: string; username: string; role: 'ADMIN' | 'CLIENT' } }> {
    return this.authService.login(body.username ?? '', body.password ?? '');
  }

  /** Inscription publique : compte CLIENT uniquement. */
  @Post('register')
  async register(
    @Body() body: { username?: string; password?: string },
  ): Promise<{ accessToken: string; user: { id: string; username: string; role: 'ADMIN' | 'CLIENT' } }> {
    return this.authService.registerClient(body.username ?? '', body.password ?? '');
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: JwtUserPayload): Promise<{ id: string; username: string; role: 'ADMIN' | 'CLIENT' }> {
    return this.authService.me(user.sub) as Promise<{ id: string; username: string; role: 'ADMIN' | 'CLIENT' }>;
  }
}
