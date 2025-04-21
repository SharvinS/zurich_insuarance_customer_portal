import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Data Transfer Object (DTO) for creating a new billing record
// Defines the required properties for a new billing entry
export class CreateBillingDto {
  // The ID of the product associated with this billing record. Must be a non-empty string
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  product_code: string;

  // The location associated with this billing record. Must be a non-empty string
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  location: string;

  // The amount of premium paid for this billing record. Must be a non-negative number
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  premium_paid: number;
}
