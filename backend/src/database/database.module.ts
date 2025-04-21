import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';

// Sets up the database connection for the application using TypeORM
@Module({
  imports: [
    // Configure TypeORM asynchronously to allow dependency injection
    TypeOrmModule.forRootAsync({
      // Specify dependencies needed
      inject: [ConfigService],
      // Return the TypeORM configuration object
      useFactory: (configService: ConfigService) => {
        // Retrieve database connection details from the configuration service
        const dbHost = configService.get<string>('DB_HOST');
        const dbPort = configService.get<number>('DB_PORT');
        const dbUsername = configService.get<string>('DB_USERNAME');
        const dbPassword = configService.get<string>('DB_PASSWORD');
        const dbName = configService.get<string>('DB_NAME');

        // Return the TypeORM options object
        return {
          type: 'postgres', // Specify the database type
          host: dbHost, // Database server host
          port: dbPort, // Database server port
          username: dbUsername, // Database username
          password: dbPassword, // Database password
          database: dbName, // Database name
          autoLoadEntities: true, // Automatically load entities defined
          synchronize: false,
        };
      },
    }),
  ],
  // Providers available within this module
  providers: [DatabaseService],
  // Export TypeOrmModule and DatabaseService so other modules can use them
  exports: [TypeOrmModule, DatabaseService],
})
export class DatabaseModule {}
