import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const headersObject = Object.fromEntries(request.headers.entries());
    const userRoles = this.getUserRolesFromHeader(headersObject);

    if (!userRoles || userRoles.length === 0) {
      throw new UnauthorizedException(
        'User roles not provided in the x-user-roles header.',
      );
    }

    return requiredRoles.some((role) => userRoles.includes(role));
  }

  private getUserRolesFromHeader(
    headers: Record<string, string | string[] | undefined>,
  ): string[] {
    const rolesHeader = headers['x-user-roles'];
    if (typeof rolesHeader === 'string') {
      return rolesHeader.split(',').map((role) => role.trim());
    } else if (Array.isArray(rolesHeader)) {
      return rolesHeader.flatMap((role) =>
        typeof role === 'string' ? role.split(',').map((r) => r.trim()) : [],
      );
    }
    return [];
  }
}
