import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';

// This guard checks if the user has the required roles for a route
@Injectable()
export class RolesGuard implements CanActivate {
  // Inject the Reflector to read metadata
  constructor(private reflector: Reflector) {}

  // Main logic for the guard to determine if access is allowed
  canActivate(context: ExecutionContext): boolean {
    // Get the roles required by the @Roles decorator on the handler or class
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [
        context.getHandler(), // Check the route handler method first
        context.getClass(), // Then check the controller class
      ],
    );

    // Let the request through if no roles are required for this route
    if (!requiredRoles) {
      return true;
    }

    // Get the underlying HTTP request object
    const request = context.switchToHttp().getRequest<Request>(); // Explicitly type the request

    // Pass the raw headers object directly to your helper function
    const userRoles = this.getUserRolesFromHeader(request.headers);

    // The user can't be authorized if the roles header is missing or empty
    if (!userRoles || userRoles.length === 0) {
      // Throw 401 because essential role information is missing
      throw new UnauthorizedException(
        'User roles not provided in the x-user-roles header',
      );
    }

    // Check if the user has any of the roles needed for this route
    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles.includes(role),
    );

    // Deny access if the user does not have any of the required roles
    if (!hasRequiredRole) {
      // Throw 403 Forbidden because the user is authenticated but lacks permissions
      throw new ForbiddenException('Insufficient permissions');
    }

    // Allow access if checks pass
    return true;
  }

  // Helper function to safely extract and parse roles from the 'x-user-roles' header
  private getUserRolesFromHeader(
    // Using NodeJS.Dict which is common for Express headers
    headers: NodeJS.Dict<string | string[]>,
  ): string[] {
    // Access the header value
    const rolesHeader = headers['x-user-roles'];

    if (typeof rolesHeader === 'string') {
      return rolesHeader.split(',').map((role) => role.trim());
    } else if (Array.isArray(rolesHeader)) {
      // Use flatMap to handle potential nested comma-separated strings within the array
      return rolesHeader.flatMap((role) =>
        typeof role === 'string' ? role.split(',').map((r) => r.trim()) : [],
      );
    }

    // If the header is missing, or not a string/array, return an empty array
    return [];
  }
}
