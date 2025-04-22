import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import {
  ApiTags,
  ApiOkResponse,
  ApiOperation,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Authentication') // Group in Swagger
@Controller('auth') // Base path /auth
export class AuthController {
  // Initialize a logger
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  // Define the handler for POST requests to '/auth/google'
  @Post('google')
  // Set the response status code to 200 OK on success
  @HttpCode(HttpStatus.OK)
  // Describe this endpoint in Swagger
  @ApiOperation({ summary: 'Authenticate user using Google ID Token' })
  // Document the successful response structure in Swagger
  @ApiOkResponse({
    description: 'Authentication successful - returns user info and app token',
  })
  // Document the possible 400 error response in Swagger
  @ApiBadRequestResponse({
    description: 'Invalid request body',
  })
  // Document the possible 401 error response in Swagger
  @ApiUnauthorizedResponse({ description: 'Invalid Google token' })
  // Define the asynchronous method to handle the request
  async googleLogin(
    // Extract and validate the request body using the GoogleLoginDto
    @Body() googleLoginDto: GoogleLoginDto,
    // Define the expected return type structure
  ): Promise<{ user: { email: string }; token: string }> {
    // Log the incoming request
    this.logger.log(`Got the Google login request`);
    // Validate the Google token by calling the service method
    const googlePayload = (await this.authService.validateGoogleToken(
      googleLoginDto.token,
    )) as {
      email: string;
      name: string;
      picture?: string;
      sub: string;
    };
    // Generate app token by calling the service method
    const result: { user: { email: string }; token: string } =
      await this.authService.handleGoogleLogin(googlePayload);
    // Log the successful login
    this.logger.log(`Google login successful for email: ${result.user.email}`);
    // Return the result containing user info and the application token
    return result;
  }
}
