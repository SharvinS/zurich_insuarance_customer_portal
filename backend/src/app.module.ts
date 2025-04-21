import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BillingModule } from './billing/billing.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';

// This is the root module of the application, ties together all other modules, controllers, and providers
@Module({
  // List of imported modules
  imports: [
    // ConfigModule.forRoot() loads .env variables and makes them available application-wide
    // isGlobal: true means we don't need to import ConfigModule in other modules
    ConfigModule.forRoot({
      isGlobal: true, // Make configuration available everywhere
    }),
    // Import the DatabaseModule to set up the database connection
    DatabaseModule,
    // Import the BillingModule which contains billing-related features
    BillingModule,
  ],
  // List of controllers defined in this module
  controllers: [AppController],
  providers: [AppService],
})
// Export the AppModule class so it can be used by main.ts
export class AppModule {}
