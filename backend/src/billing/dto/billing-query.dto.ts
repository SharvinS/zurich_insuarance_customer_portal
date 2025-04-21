import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Data Transfer Object (DTO) for querying billing records
// Defines the optional query parameters that can be used to filter billing data
export class BillingQueryDto {
  // Optional product code to filter billing records by
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  product_code?: string;

  //Optional location to filter billing records by
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;
}
