import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override handleRequest<TUser = any>(err: any, user: any): TUser {
    if (err || !user) throw err || new UnauthorizedException();
    return user as TUser;
  }

  override getRequest(context: ExecutionContext): any {
    return context.switchToHttp().getRequest();
  }
}
