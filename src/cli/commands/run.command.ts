import { Command, CommandRunner, Option } from 'nest-commander';
import { RemoteController } from '../lib/controllers/remote.controller';
import { LoggerService } from '../lib/utils/logger.service';
import { Inject, forwardRef } from '@nestjs/common';

@Command({ name: 'run', description: 'Run a behaviour by name (remote)', arguments: '<name>' })
export class RunCommand extends CommandRunner {
  constructor(
    @Inject(forwardRef(() => RemoteController))
    private readonly remoteController: RemoteController,
    private readonly logger: LoggerService
  ) {
    super();
  }

  async run(inputs: string[], options: Record<string, any>): Promise<void> {
    const [name, ...args] = inputs;
    if (!name) {
      console.log('Behaviour name is required');
      return;
    }

    this.logger.setOptions(options);

    const params: any = options.params || {};

    args.forEach(arg => {
      const [key, value] = arg.split('=');
      if (key && value !== undefined) {
        params[key] = value;
      }
    });

    try {
      const result = await this.remoteController.run(name, params, options);
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    } catch (error: any) {
      console.log(`Error: ${error.message}`);
      process.exit(1);
    }
  }

  @Option({
    flags: '-p, --params <params>',
    description: 'JSON string of parameters',
  })
  parseParams(val: string): any {
    try {
      return JSON.parse(val);
    } catch (e) {
      return {};
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
