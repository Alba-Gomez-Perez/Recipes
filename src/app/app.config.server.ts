import {ApplicationConfig, importProvidersFrom, mergeApplicationConfig} from '@angular/core';
import {provideServerRendering} from '@angular/ssr';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {Observable, of} from 'rxjs';
import {readFileSync} from 'fs';
import {join} from 'path';
import {appConfig} from './app.config';

export class ServerTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    try {
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
