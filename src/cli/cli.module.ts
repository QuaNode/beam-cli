import { Module } from '@nestjs/common';
import { LibModule } from './lib/lib.module';
import { ListCommand } from './commands/list.command';
import { RunCommand } from './commands/run.command';
import { ExecCommand, DeployCommand } from './commands/exec.command';
import { HelpCommand } from './commands/help.command';
import { VersionCommand } from './commands/version.command';

@Module({
  imports: [LibModule],
  providers: [
    ListCommand,
    RunCommand,
    ExecCommand,
    DeployCommand,
    HelpCommand,
    VersionCommand
  ]
})
export class CliModule { }
