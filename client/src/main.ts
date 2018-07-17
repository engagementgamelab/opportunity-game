import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import 'gsap';

if (environment.production) {
  enableProdMode();

  document.write('<script async src="https://www.googletagmanager.com/gtag/js?id=UA-64617433-8"></script><script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag(\'js\', new Date()); gtag(\'config\', \'UA-64617433-8\'); </script>');
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));