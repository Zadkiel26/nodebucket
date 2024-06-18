/**
 * Title: main.ts
 * Author: Professor Krasso
 * Date: 8/5/2023
 * Modified By: Zadkiel Rodriguez
 */
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
