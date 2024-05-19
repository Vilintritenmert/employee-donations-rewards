import { CommandFactory } from 'nest-commander';
import { ImportModule } from './commands/import.module';

async function bootstrap() {
  await CommandFactory.run(ImportModule, ['warn', 'error', 'debug', 'log']);
}
bootstrap();
