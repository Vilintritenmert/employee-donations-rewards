import { Module, ConsoleLogger } from '@nestjs/common';
import { ImportCommand } from './import.command';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rate } from 'src/entities/rate.entity';
import { DatabaseModule } from 'src/database.module';
import { ImportTextFile } from 'src/strategies/Import-text-file.strategy';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Rate])],
  providers: [ImportCommand, ConsoleLogger, ImportTextFile],
})
export class ImportModule {}
