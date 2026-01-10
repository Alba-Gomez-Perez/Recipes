import { mergeApplicationConfig, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideServerRendering } from '@angular/ssr';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { readFileSync } from 'fs';
import { join } from 'path';
import { appConfig } from './app.config';

export class ServerTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    try {
      // In SSR, we can read from the filesystem. 
      // The path depends on where the server is running.
      // For local dev and standard builds, 'public/assets/i18n/' or 'dist/.../browser/assets/i18n/'
      const assetsPath = join(process.cwd(), 'public', 'assets', 'i18n', `${lang}.json`);
      const content = readFileSync(assetsPath, 'utf8');
      return of(JSON.parse(content));
    } catch (e) {
      console.error(`Could not load translations for ${lang}`, e);
      return of({});
    }
  }
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: ServerTranslateLoader
        }
      })
    )
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
