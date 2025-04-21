import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { BillingRecord } from './billing-record.entity';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { BillingQueryDto } from './dto/billing-query.dto';

// Handles the core business logic for billing operations
@Injectable()
export class BillingService {
  // Setting up a logger instance for this service
  private readonly logger = new Logger(BillingService.name);

  // Injecting the TypeORM repository for BillingRecord
  constructor(
    @InjectRepository(BillingRecord)
    private readonly billingRepository: Repository<BillingRecord>,
  ) {}

  // Fetches billing records, optionally filtering by product_code and location
  // Also applies a specific filter for names starting with 'G' or 'W'
  async findAll(query: BillingQueryDto): Promise<BillingRecord[]> {
    // Build the 'where' clause for the database query based on provided filters
    const where: FindOptionsWhere<BillingRecord> = {}; // Use FindOptionsWhere for type safety
    if (query.product_code) {
      where.product_code = query.product_code;
    }
    if (query.location) {
      where.location = query.location;
    }

    this.logger.log(
      `Finding billing records with query: ${JSON.stringify(where)}`,
    );
    try {
      // Fetch initial results based on product_code and location
      const initialResults = await this.billingRepository.find({ where });

      // Apply an additional client-side filter (names starting with G or W)
      // Consider if this filter could be moved to the database query for efficiency
      const filteredResults = initialResults.filter(
        (record) =>
          record?.first_name?.startsWith('G') ||
          record?.last_name?.startsWith('W'),
      );

      this.logger.log(
        `Found ${filteredResults.length} records matching criteria`,
      );
      return filteredResults;
    } catch (error) {
      // Log any errors during the find operation
      this.logger.error(
        `Failed to find billing records with query ${JSON.stringify(where)}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      // Rethrow the error to be handled by the global exception filter or controller
      throw error;
    }
  }

  // Creates a new billing record in the database
  async create(createBillingDto: CreateBillingDto): Promise<BillingRecord> {
    this.logger.log(
      `Attempting to create billing record with data: ${JSON.stringify(createBillingDto)}`,
    );
    try {
      // Create a new entity instance from the DTO
      const newRecord = this.billingRepository.create(createBillingDto);
      // Save the new entity to the database
      const savedRecord = await this.billingRepository.save(newRecord);
      this.logger.log(
        `Successfully created billing record with ID: ${savedRecord.id}`,
      );
      return savedRecord;
    } catch (error) {
      // Log any errors during creation
      this.logger.error(
        `Failed to create billing record: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      // Rethrow the error
      throw error;
    }
  }

  // Updates an existing billing record identified by product_code
  async update(
    product_code: string,
    updateBillingDto: UpdateBillingDto,
  ): Promise<BillingRecord> {
    this.logger.log(
      `Attempting to update record with product_code: ${product_code} with data: ${JSON.stringify(updateBillingDto)}`,
    );
    try {
      // Find the existing record by product_code
      const recordToUpdate = await this.billingRepository.findOne({
        where: { product_code },
      });

      // If the record doesn't exist, throw a NotFoundException
      if (!recordToUpdate) {
        this.logger.warn(
          `Record with product_code: ${product_code} not found for update`,
        );
        // Throw standard NestJS exception for better API consistency
        throw new NotFoundException(
          `Billing record with product_code "${product_code}" not found`,
        );
      }

      // Merge the update DTO into the found record
      Object.assign(recordToUpdate, updateBillingDto);
      // Save the updated record back to the database
      const updatedRecord = await this.billingRepository.save(recordToUpdate);
      this.logger.log(
        `Successfully updated record with product_code: ${product_code}`,
      );
      return updatedRecord;
    } catch (error) {
      // Don't log NotFoundException again if it was thrown intentionally
      if (!(error instanceof NotFoundException)) {
        this.logger.error(
          `Failed to update record with product_code ${product_code}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
      // Rethrow the error
      throw error;
    }
  }

  // Deletes a billing record identified by product_code
  async remove(product_code: string): Promise<void> {
    this.logger.log(
      `Attempting to delete record with product_code: ${product_code}`,
    );
    try {
      // Attempt to delete the record directly using the product_code
      const deleteResult = await this.billingRepository.delete({ product_code });

      // Check if any rows were actually affected
      if (deleteResult.affected === 0) {
        this.logger.warn(
          `Record with product_code: ${product_code} not found for deletion`,
        );
        // Throw standard NestJS exception
        throw new NotFoundException(
          `Billing record with product_code "${product_code}" not found`,
        );
      } else {
        this.logger.log(
          `Successfully deleted record with product_code: ${product_code}`,
        );
      }
    } catch (error) {
      // Don't log NotFoundException again if it was thrown intentionally
      if (!(error instanceof NotFoundException)) {
        this.logger.error(
          `Failed to delete record with product_code ${product_code}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
      // Rethrow the error
      throw error;
    }
  }
}
