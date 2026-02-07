#!/usr/bin/env node
import 'reflect-metadata';
import { CommandFactory } from 'nest-commander';
import { CliModule } from './cli.module';

async function bootstrap() {
  await CommandFactory.run(CliModule, ['warn', 'error']);
}

process.on('unhandledRejection', (reason: any, promise) => {
  if (reason && (reason.code === 'ECONNREFUSED' ||
    reason.message?.includes('ECONNREFUSED') ||
    reason.message?.includes('Error in initializing Behaviours'))) {
    return;
  }
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

bootstrap();
