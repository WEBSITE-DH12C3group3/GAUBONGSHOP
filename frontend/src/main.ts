// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';
import { DATE_PIPE_DEFAULT_TIMEZONE, registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';

import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';

// Đăng ký locale tiếng Việt cho toàn app
registerLocaleData(localeVi);

bootstrapApplication(AppComponent, {
  // giữ nguyên mọi cấu hình sẵn có
  ...appConfig,
  // nối thêm providers để không ghi đè cái cũ
  providers: [
    ...(appConfig.providers ?? []),
    // Mặc định format hiển thị theo tiếng Việt
    { provide: LOCALE_ID, useValue: 'vi' },
    // Mặc định mọi DatePipe hiển thị theo múi giờ Việt Nam
    { provide: DATE_PIPE_DEFAULT_TIMEZONE, useValue: 'Asia/Ho_Chi_Minh' },
  ],
}).catch(err => console.error(err));
