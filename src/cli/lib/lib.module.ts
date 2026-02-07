import { Module } from '@nestjs/common';
import { BehavioursService } from './services/behaviours.service';
import { RemoteController } from './controllers/remote.controller';
import { LocalController } from './controllers/local.controller';
import { LoggerService } from './utils/logger.service';

@Module({
  providers: [
    {
      provide: LoggerService,
      useFactory: () => LoggerService.getInstance(),
    },
    BehavioursService,
    RemoteController,
    LocalController
  ],
  exports: [
    LoggerService,
    BehavioursService,
    RemoteController,
    LocalController
  ]
})
export class LibModule { }
