import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { BillingRecord } from '../billing/billing-record.entity';
import { JwtModule } from '@nestjs/jwt';

// Defines the Authentication module
@Module({
  imports: [
    ConfigModule, // Provides ConfigService
    TypeOrmModule.forFeature([BillingRecord]), // Provides BillingRecord repository
    // Asynchronously configure JwtModule
    JwtModule.registerAsync({
      imports: [ConfigModule], // Depends on ConfigModule
      inject: [ConfigService], // Inject ConfigService into the factory
      // Create JWT configuration
      useFactory: (configService: ConfigService) => ({
        // Get JWT secret from environment variables
        secret: configService.get<string>('JWT_SECRET'),
        // Set token options
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  // Services provided by this module
  providers: [AuthService],
  // Controllers managed by this module
  controllers: [AuthController],
})
export class AuthModule {}
