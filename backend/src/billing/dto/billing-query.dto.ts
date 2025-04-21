import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BillingQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  product_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;
}
