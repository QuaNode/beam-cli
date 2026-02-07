import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { LoggerService } from '../utils/logger.service';

@Injectable()
export class LocalController {
  constructor(
    @Inject(forwardRef(() => LoggerService))
    private readonly logger: LoggerService
  ) { }

  async exec(name: string, args: string[], options: any = {}): Promise<void> {
    this.logger.log(`Executing local command: ${name}`);
    this.logger.log(`Args: ${args.join(', ')}`);
    this.logger.success(`Executed local command '${name}' successfully.`);
  }

  async deploy(name: string, env: string, options: any = {}): Promise<void> {
    this.logger.log(`Deploying behaviour '${name}' to environment: ${env}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    this.logger.success(`Deployment of '${name}' successful!`);
  }
}
