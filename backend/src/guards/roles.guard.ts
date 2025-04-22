import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Let the request through if no roles are required for this route
    if (!requiredRoles) {
      return true;
    }

    // Get request object including the user payload attached by AuthMiddleware
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { roles?: string[] } }>();
    // Get user roles from the JWT payload attached to the request
    const userRoles = request.user?.roles;

    // If user data or roles are missing from the token payload
    if (!userRoles || userRoles.length === 0) {
      throw new UnauthorizedException(
        'User role information not found in token',
      );
    }

    // Check if the user has any of the roles needed for this route
    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles.includes(role),
    );

    if (!hasRequiredRole) {
      // User is authenticated but lacks permission
      throw new ForbiddenException('Insufficient permissions');
    }

    // User has the required role
    return true;
  }
}
