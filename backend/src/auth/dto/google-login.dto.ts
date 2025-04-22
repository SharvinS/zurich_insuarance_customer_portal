import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Data Transfer Object (DTO) for handling the Google login request body
// Defines the expected structure and validation rules for the incoming data
export class GoogleLoginDto {
  // The Google ID Token received from the frontend client after successful Google sign-in
  // This token will be verified by the backend
  @ApiProperty({ description: 'Google ID Token received from frontend' }) // Document this property in Swagger
  @IsString() // Validate that the value is a string
  @IsNotEmpty() // Validate that the value is not empty
  token: string; // The property holding the token string
}
