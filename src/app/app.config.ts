import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Habilitar router con binding de inputs (permite leer parámetros como @Input)
    provideRouter(routes, withComponentInputBinding()),
    // Habilitar animaciones para componentes Material
    provideAnimations(),
    // Habilitar HttpClient para peticiones API
    provideHttpClient()
  ]
};
