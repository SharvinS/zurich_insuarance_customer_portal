import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { BillingQueryDto } from './dto/billing-query.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BillingRecord } from './billing-record.entity';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

// Sets up the routes for handling billing-related requests
@ApiTags('Billing') // Groups these endpoints under 'Billing' in Swagger UI
@Controller('billing') // Base path for all routes in this controller is /billing
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // GET /billing - Fetches billing records, allows filtering via query parameters
  @Get()
  @ApiOkResponse({
    type: [BillingRecord], // Tells Swagger the expected success response type
    description: 'Retrieve billing records',
  })
  @ApiQuery({ name: 'product_code', required: false, type: String }) // Documents the optional product_code query param in Swagger
  @ApiQuery({ name: 'location', required: false, type: String }) // Documents the optional location query param in Swagger
  findAll(@Query() query: BillingQueryDto): Promise<BillingRecord[]> {
    // Passes the query parameters to the service layer
    return this.billingService.findAll(query);
  }

  // POST /billing - Creates a new billing record, requires 'admin' role
  @Post()
  @Roles('admin') // Restricts this endpoint to users with the 'admin' role
  @UseGuards(RolesGuard) // Applies the RolesGuard to enforce the role check
  @ApiCreatedResponse({
    type: BillingRecord, // Tells Swagger the expected response type on successful creation
    description: 'Billing record created successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' }) // Documents the potential 401/403 error in Swagger
  create(@Body() createBillingDto: CreateBillingDto): Promise<BillingRecord> {
    // Passes the request body (DTO) to the service for creation
    return this.billingService.create(createBillingDto);
  }

  // PUT /billing - Updates a billing record identified by product_code in the query, requires 'admin' role
  @Put()
  @Roles('admin') // Restricts to 'admin' role
  @UseGuards(RolesGuard) // Enforces role check
  @ApiOkResponse({
    type: BillingRecord, // Tells Swagger the expected response type on successful update
    description: 'Billing record updated successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' }) // Documents potential auth error
  @ApiQuery({
    name: 'product_code', // Specifies the query parameter name
    required: true,
    type: String,
    description: 'Product Code of the record to update',
  })
  update(
    @Query('product_code') product_code: string, // Extracts product_code from the query string
    @Body() updateBillingDto: UpdateBillingDto, // Extracts the update data from the request body
  ): Promise<BillingRecord | undefined> {
    // Passes the identifier and update data to the service
    return this.billingService.update(product_code, updateBillingDto);
  }

  // DELETE /billing - Deletes a billing record identified by product_code in the query, requires 'admin' role
  @Delete()
  @Roles('admin') // Restricts to 'admin' role
  @UseGuards(RolesGuard) // Enforces role check
  @ApiOkResponse({ description: 'Billing record deleted successfully' }) // Describes the successful deletion response
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' }) // Documents potential auth error
  @ApiQuery({
    name: 'product_code', // Specifies the query parameter name
    required: true,
    type: String,
    description: 'Product Code of the record to delete',
  })
  remove(@Query('product_code') product_code: string): Promise<void> {
    // Passes the identifier to the service for deletion
    return this.billingService.remove(product_code);
  }
}
