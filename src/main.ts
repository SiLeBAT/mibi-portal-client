import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { KeycloakService } from './app/user/services/keycloak.service';
import { environment } from './environments/environment';
if (environment.production) {
    enableProdMode();
}

const keycloakService = new KeycloakService();

// eslint-disable-next-line no-void
void keycloakService.init()
    .then(() => {
        platformBrowserDynamic().bootstrapModule(AppModule).catch(() => {
            throw new Error('Unable to bootstrap application.');
        });
    });


