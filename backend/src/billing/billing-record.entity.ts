import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'BILLING_RECORDS' })
export class BillingRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ required: false })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  product_id: string | null;

  @ApiProperty({ required: false })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  location: string | null;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  premium_paid: number;

  @ApiProperty({ required: false })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  first_name: string | null;

  @ApiProperty({ required: false })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  last_name: string | null;

  @ApiProperty({ required: false })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    required: false,
    description: 'URL or path to the photo',
    maxLength: 2048,
  })
  @Column({
    type: 'varchar',
    length: 2048,
    nullable: true,
  })
  photo: string | null;
}
