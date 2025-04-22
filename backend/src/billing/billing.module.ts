import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingRecord } from './billing-record.entity';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

// Defines the Billing module annd bundling related components like controllers and services
@Module({
  // Imports other modules needed
  imports: [TypeOrmModule.forFeature([BillingRecord]), JwtModule, ConfigModule],
  // List the controllers
  controllers: [BillingController],
  // Lists the services
  providers: [BillingService],
})
// Implementing NestModule to configure middleware
export class BillingModule implements NestModule {
  // This method is used to configure middleware for the module routes
  configure(consumer: MiddlewareConsumer) {
    // Applies the AuthMiddleware to all routes defined within the BillingController
    consumer.apply(AuthMiddleware).forRoutes(BillingController);
  }
}
