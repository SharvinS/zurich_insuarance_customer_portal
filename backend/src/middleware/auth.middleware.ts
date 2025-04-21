import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  // Add a logger instance
  private readonly logger = new Logger(AuthMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const adminToken = process.env.ADMIN_TOKEN;
    // Log the expected token once when middleware is likely initialized or first run
    this.logger.debug(`Expected ADMIN_TOKEN: ${adminToken}`);

    if (req.method !== 'GET') {
      const authHeader = req.headers.authorization;
      let token: string | undefined;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        // Log the received token
        this.logger.debug(`Received Token from Header: ${token}`);
      } else {
        this.logger.warn('Authorization header missing or not Bearer'); // Log if header is wrong
      }

      // Log the comparison result
      this.logger.debug(
        `Comparing Received (${token}) with Expected (${adminToken})`,
      );

      if (!token || token !== adminToken) {
        this.logger.error(
          'Token mismatch or missing token. Throwing UnauthorizedException.',
        ); // Log before throwing
        throw new UnauthorizedException(
          'Invalid or missing Bearer token in Authorization header',
        );
      } else {
        this.logger.log('Token validated successfully'); // Log success
      }
    }

    next();
  }
}
