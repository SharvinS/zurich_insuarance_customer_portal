import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'jsonwebtoken';

// Define your expected JWT payload structure directly in this file
interface UserJwtPayload extends JwtPayload {
  sub: string;
  email: string;
  roles: string[];
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Apply auth check only to non-GET requests
    if (req.method !== 'GET') {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.logger.warn('Authorization header missing or not Bearer');
        throw new UnauthorizedException(
          'Missing or invalid authorization header',
        );
      }
      // Extract token
      const token = authHeader.substring(7);

      try {
        // Verify the token using JwtService
        const jwt = new JwtService({
          secret: this.configService.get<string>('JWT_SECRET'),
        });
        const payload = await jwt.verifyAsync<UserJwtPayload>(token);

        // Attach payload to the request object
        (req as Request & { user: UserJwtPayload }).user = payload;

        this.logger.log(
          `Authenticated user: ${payload.email} (ID: ${payload.sub})`,
        );
        next(); // Token is valid
      } catch (error: unknown) {
        this.logger.error(
          `JWT validation failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
        if (error instanceof Error && error.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token has expired');
        }
        throw new UnauthorizedException('Invalid token');
      }
    } else {
      // For GET requests just proceed without auth check
      this.logger.debug(`Skipping auth check for GET request: ${req.path}`);
      next();
    }
  }
}
