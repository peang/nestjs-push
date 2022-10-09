<h1 align="center"></h1>

<div align="center">
  <a href="http://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo_text.svg" width="150" alt="Nest Logo" />
  </a>
</div>

<h3 align="center">NestJS FCM push notifications module</h3>

<div align="center">
  <a href="https://nestjs.com" target="_blank">
    <img src="https://img.shields.io/badge/built%20with-NestJs-red.svg" alt="Built with NestJS">
  </a>
</div>

### Installation

```bash
npm install --save nestjs-push
```

### FcmModule

To use PushService you must add the module first. 
**The `PushModule` has a `@Global()` attribute so you should only import it once**.

```typescript
import { Module } from '@nestjs/common';
import * as path from 'path';
import { PushModule } from 'nestjs-push';

@Module({
  imports: [
    PushModule.forRoot({
      serviceJsonPath: path.join(__dirname, '../service-account.json'),
    }),
  ],
  controllers: [],
})
export class AppModule {}
```

### `PushService` use service-account-json.json file to send notifications using firebase-admin dependency.

```typescript
@Injectable()
export class SampleService {
  constructor(private readonly pushService: PushService) {}

  async doStuff() {
    await this.pushService.sendToDevices([
        'device_token_1',
        'device_token_1',
      ],
      payload,
      imageUrl,
    ]);

    await this.pushService.sendToTopics(
      'topic-name',
      payload,
      imageUrl,
    ]);
  }
}
```

## Change Log

See [Changelog](CHANGELOG.md) for more information.

## Contributing

Contributions welcome! See [Contributing](CONTRIBUTING.md).

## Author

**Razvan Costianu**

## License

Licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
