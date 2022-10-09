import { DynamicModule, Global, Logger, Module } from '@nestjs/common';
import { ValueProvider } from '@nestjs/common/interfaces/modules/provider.interface';
import { PushConfigs, PUSH_CONFIGS } from './interfaces/push-configs.interface';
import { PushService } from './services/push.service';

@Global()
@Module({})
export class PushModule {
  static forRoot(options: PushConfigs): DynamicModule {
    const providers: ValueProvider = {
      provide: PUSH_CONFIGS,
      useValue: options,
    };
    const logger = options.logger ? options.logger : new Logger('PushService');
    return {
      module: PushModule,
      providers: [
        { provide: Logger, useValue: logger },
        PushService,
        providers,
      ],
      exports: [PushService],
    };
  }
}
