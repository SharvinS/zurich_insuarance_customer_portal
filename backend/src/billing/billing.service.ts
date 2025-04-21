import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingRecord } from './billing-record.entity';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { BillingQueryDto } from './dto/billing-query.dto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectRepository(BillingRecord)
    private readonly billingRepository: Repository<BillingRecord>,
  ) {}

  async findAll(query: BillingQueryDto): Promise<BillingRecord[]> {
    const where: Partial<BillingQueryDto> = {};
    if (query.product_id) {
      where.product_id = query.product_id;
    }
    if (query.location) {
      where.location = query.location;
    }

    try {
      const initialResults = await this.billingRepository.find({ where });

      const filteredResults = initialResults.filter(
        (record) =>
          record?.first_name?.startsWith('G') ||
          record?.last_name?.startsWith('W'),
      );
      return filteredResults;
    } catch (error) {
      this.logger.error(
        `Error executing findAll query: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async create(createBillingDto: CreateBillingDto): Promise<BillingRecord> {
    try {
      const newRecord = this.billingRepository.create(createBillingDto);
      const savedRecord = await this.billingRepository.save(newRecord);
      return savedRecord;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Error creating billing record: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          'An unknown error occurred while creating billing record.',
        );
      }
      throw error;
    }
  }

  async update(
    product_id: string,
    updateBillingDto: UpdateBillingDto,
  ): Promise<BillingRecord | undefined> {
    try {
      const recordToUpdate = await this.billingRepository.findOne({
        where: { product_id },
      });

      if (!recordToUpdate) {
        this.logger.warn(
          `Record with product_id: ${product_id} not found for update.`,
        );
        return undefined;
      }

      Object.assign(recordToUpdate, updateBillingDto);
      const updatedRecord = await this.billingRepository.save(recordToUpdate);
      this.logger.log(
        `Successfully updated record with product_id: ${product_id}`,
      );
      return updatedRecord;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error updating record with product_id ${product_id}: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Error updating record with product_id ${product_id}: Unknown error occurred.`,
        );
      }
      throw error;
    }
  }

  async remove(product_id: string): Promise<void> {
    this.logger.log(
      `Attempting to delete record with product_id: ${product_id}`,
    );
    try {
      const deleteResult = await this.billingRepository.delete({ product_id });
      if (deleteResult.affected === 0) {
        this.logger.warn(
          `Record with product_id: ${product_id} not found for deletion.`,
        );
      } else {
        this.logger.log(
          `Successfully deleted record with product_id: ${product_id}`,
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Error deleting record with product_id ${product_id}: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Error deleting record with product_id ${product_id}: Unknown error occurred.`,
        );
      }
      throw error;
    }
  }
}
