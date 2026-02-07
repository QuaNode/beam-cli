import { Command, CommandRunner, Option } from 'nest-commander';
import { RemoteController } from '../lib/controllers/remote.controller';
import { LoggerService } from '../lib/utils/logger.service';
import { Inject, forwardRef } from '@nestjs/common';

@Command({ name: 'list', description: 'List all available remote behaviours' })
export class ListCommand extends CommandRunner {
  constructor(
    @Inject(forwardRef(() => RemoteController))
    private readonly remoteController: RemoteController,
    private readonly logger: LoggerService
  ) {
    super();
  }

  async run(inputs: string[], options: Record<string, any>): Promise<void> {
    this.logger.setOptions(options);

    try {
      const result = await this.remoteController.run('list', {}, options);
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    } catch (error: any) {
      console.log(`Error: ${error.message}`);
      process.exit(1);
    }
  }

  @Option({
    flags: '-v, --verbose',
    description: 'Enable verbose logging',
  })
  parseVerbose(): boolean {
    return true;
  }
}
