import {
  Injectable,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuth2Client } from 'google-auth-library';
import { BillingRecord } from '../billing/billing-record.entity';

// Service responsible for authentication logic
@Injectable()
export class AuthService {
  // Logger instance
  private readonly logger = new Logger(AuthService.name);
  // Google OAuth client instance
  private googleClient: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(BillingRecord)
    private readonly billingRepository: Repository<BillingRecord>,
  ) {
    // Get Google Client using ID from environment variables
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    // Log error if client ID is missing
    if (!clientId) {
      this.logger.error('GOOGLE_CLIENT_ID is not configured in .env file!');
    } else {
      // Create new Google OAuth client instance
      this.googleClient = new OAuth2Client(clientId);
    }
  }

  // Validate the Google ID token received from the frontend
  async validateGoogleToken(token: string): Promise<{
    email: string;
    name?: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
    sub: string;
  }> {
    // Check if Google client was initialized
    if (!this.googleClient) {
      throw new InternalServerErrorException(
        'Google Auth Client not initialized',
      );
    }
    try {
      // Verify the token using Google's library against our client ID
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });
      // Extract payload from the verified ticket
      const payload = ticket.getPayload() as {
        email: string;
        name?: string;
        picture?: string;
        given_name?: string;
        family_name?: string;
        sub: string;
      };
      // Throw error if payload is missing
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token payload');
      }
      // Log successful validation
      this.logger.log(`Google token validated for email: ${payload.email}`);
      // Return the payload containing user info
      return payload;
    } catch (error) {
      // Log errors
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Google token validation failed: ${errorMessage}`);
      // Throw unauthorized exception
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  // Handle the login process after Google token is validated
  async handleGoogleLogin(googlePayload: {
    email: string;
    name?: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
    sub: string;
  }): Promise<{ user: any; token: string }> {
    // Get user info from Google payload
    const { email, given_name, family_name } = googlePayload;

    // Ensure email exists
    if (!email) {
      throw new UnauthorizedException('Email not found in Google payload');
    }

    // Find user in our database using email
    const userRecord = await this.billingRepository.findOne({
      where: { email },
    });

    // Determine user roles based on email matching ADMIN_EMAIL env variable
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const roles = adminEmail && email === adminEmail ? ['admin'] : ['user'];

    // Prepare payload for our application's JWT
    const jwtPayload = {
      // Use DB ID if user exists else fallback to Google sub as subject
      sub: userRecord?.id ?? googlePayload.sub,
      email: email, // Use email from Google payload
      roles: roles, // Assign determined roles
    };

    // Generate the application JWT
    const appToken = await this.jwtService.signAsync(jwtPayload);

    // Prepare user object to return to the frontend
    const userForFrontend = {
      id: userRecord?.id, // Include DB ID if available
      email: email, // Use email from Google payload
      name: `${given_name} ${family_name}`,
      roles: roles, // Include assigned roles
    };

    // Return the user info and the generated application token
    return { user: userForFrontend, token: appToken };
  }
}
