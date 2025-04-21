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
import { Request } from 'express';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  @ApiOkResponse({
    type: [BillingRecord],
    description: 'Retrieve billing records',
  })
  @ApiQuery({ name: 'product_id', required: false, type: String })
  @ApiQuery({ name: 'location', required: false, type: String })
  findAll(@Query() query: BillingQueryDto): Promise<BillingRecord[]> {
    return this.billingService.findAll(query);
  }

  @Post()
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiCreatedResponse({
    type: BillingRecord,
    description: 'Billing record created successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  create(@Body() createBillingDto: CreateBillingDto): Promise<BillingRecord> {
    return this.billingService.create(createBillingDto);
  }

  @Put()
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOkResponse({
    type: BillingRecord,
    description: 'Billing record updated successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  @ApiQuery({
    name: 'product_id',
    required: true,
    type: String,
    description: 'Product code to update',
  })
  update(
    @Query('product_id') product_id: string,
    @Body() updateBillingDto: UpdateBillingDto,
  ): Promise<BillingRecord | undefined> {
    return this.billingService.update(product_id, updateBillingDto);
  }

  @Delete()
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOkResponse({ description: 'Billing record deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access' })
  @ApiQuery({
    name: 'product_id',
    required: true,
    type: String,
    description: 'Product code to delete',
  })
  remove(@Query('product_id') product_id: string): Promise<void> {
    return this.billingService.remove(product_id);
  }
}
