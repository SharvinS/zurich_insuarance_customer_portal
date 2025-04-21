import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

// Service to provide access to the raw TypeORM database connection
@Injectable()
export class DatabaseService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  // Returns the raw TypeORM connection object
  getDbConnection(): Connection {
    return this.connection;
  }
}
