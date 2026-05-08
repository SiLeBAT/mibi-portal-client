import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { KEYCLOAK_ENABLED } from './app/user/services/auth.tokens';

if (environment.production) {
    enableProdMode();
}

// Resolve the backend auth mode before bootstrapping so the app can branch
// synchronously between legacy login and Keycloak SSO. /v2/info is public, so
// this works pre-authentication. Any failure falls back to legacy auth.
async function resolveKeycloakEnabled(): Promise<boolean> {
    try {
        const res = await fetch('/v2/info', { cache: 'no-store' });
        if (!res.ok) {
            return false;
        }
        const info = await res.json();
        return Boolean(info && info.keycloakEnabled);
    } catch {
        return false;
    }
}

async function bootstrap(): Promise<void> {
    const keycloakEnabled = await resolveKeycloakEnabled();
    await platformBrowserDynamic([
        { provide: KEYCLOAK_ENABLED, useValue: keycloakEnabled }
    ]).bootstrapModule(AppModule);
}

bootstrap().catch(() => {
    throw new Error('Unable to bootstrap application.');
});
