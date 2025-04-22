import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BillingModule } from './billing/billing.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { Logger } from '@nestjs/common';

// This is the root module of the application, ties together all other modules, controllers, and providers
@Module({
  // List of imported modules
  imports: [
    // ConfigModule.forRoot() loads .env variables and makes them available application-wide
    // isGlobal: true means we don't need to import ConfigModule in other modules
    ConfigModule.forRoot({
      isGlobal: true, // Make configuration available everywhere
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET'); // Get secret from .env

        Logger.log(
          `JWT Secret from ConfigService: ${secret ? 'JWT_SECRET LOADED' : 'UNDEFINED!'}`,
          'JwtModuleFactory',
        );

        if (!secret) {
          Logger.error(
            'ERROR: JWT_SECRET is not defined in environment variables!',
            'JwtModuleFactory',
          );
        }

        return {
          secret: secret, // Use the retrieved secret
          signOptions: {
            expiresIn: configService.get<string>(
              'JWT_EXPIRATION_TIME',
              '3600s',
            ), // Get expiration time or default
          },
          global: true, // Make JWT services available globally
        };
      },
    }),
    // Import the DatabaseModule to set up the database connection
    DatabaseModule,
    // Import the BillingModule which contains billing-related features
    BillingModule,
    // Import the AuthModule for authentication features
    AuthModule,
  ],
  // List of controllers defined in this module
  controllers: [AppController],
  providers: [AppService],
})
// Export the AppModule class so it can be used by main.ts
export class AppModule {}
