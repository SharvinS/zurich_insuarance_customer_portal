import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

// Represents a billing record in the database
// This entity maps to the 'BILLING_RECORDS' table
@Entity({ name: 'BILLING_RECORDS' })
export class BillingRecord {
  // Auto-generated unique identifier for the billing record
  @PrimaryGeneratedColumn()
  id: number;

  // Product Code linked to this billing entry
  @ApiProperty({ required: false })
  @Column({
    type: 'varchar', // DB column type
    nullable: true,
  })
  product_code: string | null; // Type is string or null

  // Location tied to this billing entry
  @ApiProperty({ required: false })
  @Column({
    type: 'varchar', // DB column type
    nullable: true,
  })
  location: string | null; // Type is string or null

  // Premium paid, stored as decimal(10, 2)
  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 }) // DB column type with precision/scale
  premium_paid: number; // Type is number

  // First name for this record
  @ApiProperty({ required: false })
  @Column({
    type: 'varchar', // DB column type
    nullable: true,
  })
  first_name: string | null; // Type is string or null

  // Last name for this record
  @ApiProperty({ required: false })
  @Column({
    type: 'varchar', // DB column type
    nullable: true,
  })
  last_name: string | null; // Type is string or null

  // Email address for this record
  @ApiProperty({ required: false })
  @Column({
    type: 'varchar', // DB column type
    nullable: true,
  })
  email: string | null; // Type is string or null

  // URL or path for a photo
  @ApiProperty({
    required: false,
    description: 'URL or path to the photo', // Swagger description
    maxLength: 2048, // Swagger max length
  })
  @Column({
    type: 'varchar', // DB column type
    length: 2048, // DB max length
    nullable: true,
  })
  photo: string | null; // Type is string or null
}
