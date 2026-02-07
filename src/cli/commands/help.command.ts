import { Command, CommandRunner } from 'nest-commander';

@Command({ name: 'help', description: 'Display help information', arguments: '[command]' })
export class HelpCommand extends CommandRunner {
  async run(inputs: string[], options: Record<string, any>): Promise<void> {
    console.log('Use --help to see available commands');
  }
}
