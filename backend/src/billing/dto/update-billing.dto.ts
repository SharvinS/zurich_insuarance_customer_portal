import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Data Transfer Object (DTO) for updating an existing billing record
// Defines the optional properties that can be modified
export class UpdateBillingDto {
  // Optional new location for the billing record. If provided, it must be a string
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  // Optional new premium amount for the billing record. If provided, it must be a non-negative number
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  premium_paid?: number;
}
