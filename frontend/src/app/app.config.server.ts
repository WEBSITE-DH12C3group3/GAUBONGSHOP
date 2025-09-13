// src/app/app.config.server.ts
import { ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig as clientConfig } from './app.config';

export const appConfig: ApplicationConfig = {
  ...clientConfig,
  providers: [
    ...(clientConfig.providers ?? []),
    provideServerRendering(),   // cấu hình cho SSR phía server
  ],
};
