import { Command, CommandRunner } from 'nest-commander';

@Command({ name: 'version', description: 'Display version information' })
export class VersionCommand extends CommandRunner {
  async run(): Promise<void> {
    const version = require('../../../package.json').version;
    console.log(`beam-cli version: ${version}`);
  }
}