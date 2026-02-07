import { Command, CommandRunner, Option, SubCommand } from 'nest-commander';
import { LocalController } from '../lib/controllers/local.controller';
import { RemoteController } from '../lib/controllers/remote.controller';
import { Inject, forwardRef } from '@nestjs/common';

@SubCommand({ name: 'deploy', description: 'Deploy a behaviour', arguments: '[name]' })
export class DeployCommand extends CommandRunner {
  constructor(
    @Inject(forwardRef(() => LocalController))
    private readonly localController: LocalController
  ) {
    super();
  }

  async run(inputs: string[], options: Record<string, any>): Promise<void> {
    const [name] = inputs;
    const env = options.env || 'local';
    await this.localController.deploy(name, env);
  }

  @Option({
    flags: '-e, --env <env>',
    description: 'Environment to deploy to',
  })
  parseEnv(val: string): string {
    return val;
  }
}

@Command({ name: 'exec', description: 'Execute a command (local)', subCommands: [DeployCommand] })
export class ExecCommand extends CommandRunner {
  constructor(
    @Inject(forwardRef(() => LocalController))
    private readonly localController: LocalController,
    @Inject(forwardRef(() => RemoteController))
    private readonly remoteController: RemoteController
  ) {
    super();
  }

  async run(inputs: string[]): Promise<void> {
    const [name, ...args] = inputs;
    if (name === 'deploy') {
      // Subcommand handles this, but if called genericly:
      return;
    }

    // Fallback for other exec commands
    await this.localController.exec(name, args);
  }
}
