import { Command, CommandRunner } from 'nest-commander';
import { ImportTextFile } from 'src/strategies/Import-text-file.strategy';

@Command({
  name: 'import',
  description: 'Import data files',
})
export class ImportCommand extends CommandRunner {
  constructor(private readonly importTextFile: ImportTextFile) {
    super();
  }

  async run([filePath]: string[]): Promise<void> {
    await this.importTextFile.run(filePath);
  }
}
