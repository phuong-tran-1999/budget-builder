import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { maskConfigFunction } from '@modules/shared/core';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { thirdPartyProviders } from './app.provider';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(appRoutes),
        provideEnvironmentNgxMask(maskConfigFunction),
        provideAnimationsAsync(),
        ...thirdPartyProviders,
    ],
};
