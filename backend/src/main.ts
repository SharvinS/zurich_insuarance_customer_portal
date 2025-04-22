import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';

// The main entry point for bootstrapping the NestJS application
async function bootstrap() {
  // Create a NestJS application instance using the root AppModule
  const app = await NestFactory.create(AppModule);

  // Enable Cross-Origin Resource Sharing (CORS)
  app.enableCors({
    // Allow requests specifically from the frontend application running on localhost:3001
    origin: 'http://localhost:3001',
  });

  // Apply global validation pipes to automatically validate incoming request data (DTOs)
  app.useGlobalPipes(new ValidationPipe());

  // Configure Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Zurich Billing') // Set the title for the Swagger UI page
    .setDescription('API for Zurich customer') // Add a description
    .setVersion('1.0') // Set the API version
    // Configure Bearer token authentication for Swagger UI
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'Authorization',
    )
    .build(); // Build the configuration object

  // Create the Swagger document using the application instance and the config
  const document = SwaggerModule.createDocument(app, config);

  document.paths = Object.fromEntries(
    Object.entries(document.paths).map(([path, methods]) => {
      Object.entries(methods).forEach(([_, operation]) => {
        const op = operation as {
          [key: string]: any;
          security?: { [key: string]: any }[];
        };
        if (!op.security) {
          op.security = [{ Authorization: [] }];
        }
        console.log(_);
      });
      return [path, methods];
    }),
  );
  // Set up the Swagger UI endpoint at '/api'
  SwaggerModule.setup('api', app, document);

  // Start the application, listening for incoming requests on port 3000
  await app.listen(3000);
  // Log the application URL and Swagger UI URL to the console once started
  console.log(`Application: ${await app.getUrl()}`);
  console.log(`Swagger UI: ${await app.getUrl()}/api`);
}

// Execute the bootstrap function and catch any potential errors during startup
bootstrap().catch((error) => {
  console.error('Application error:', error);
});
