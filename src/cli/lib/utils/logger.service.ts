import { Injectable, Logger } from '@nestjs/common';

const chalk = require('chalk');

@Injectable()
export class LoggerService {
  private static instance: LoggerService;
  private readonly logger = new Logger('BeamCLI');
  private verbose: boolean = false;

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  setOptions(options: any) {
    if (options && options.verbose) {
      this.verbose = true;
    }
  }

  log(message: string) {
    if (this.verbose) {
      console.log(chalk.blue('[INFO]'), message);
    }
  }

  error(message: string, trace?: string) {
    console.log(chalk.red('[ERROR]'), message);
    if (trace) console.error(trace);
  }

  warn(message: string) {
    if (this.verbose) {
      console.log(chalk.yellow('[WARN]'), message);
    }
  }

  debug(message: string) {
    if (this.verbose || process.env.DEBUG) {
      console.log(chalk.gray('[DEBUG]'), message);
    }
  }

  success(message: string) {
    if (this.verbose) {
      console.log(chalk.green('[SUCCESS]'), message);
    }
  }
}