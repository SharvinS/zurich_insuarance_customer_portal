import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authToken = req.headers['x-auth-token'];
    const adminToken = process.env.ADMIN_TOKEN;

    if (req.method !== 'GET') {
      if (!authToken || authToken !== adminToken) {
        throw new UnauthorizedException(
          'Invalid or missing authentication token.',
        );
      }
    }

    next();
  }
}
