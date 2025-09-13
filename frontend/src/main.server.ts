// src/main.server.ts
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config.server';
import { provideServerRendering } from '@angular/platform-server';

export default function bootstrap(context: BootstrapContext) {
  return bootstrapApplication(
    AppComponent,
    appConfig, // ✅ Sử dụng config đã có sẵn (không thêm providers)
    context
  );
}
