import { InjectionToken } from '@angular/core';

/**
 * Whether the backend has the Keycloak IAM integration enabled. The value is
 * fetched from the server's public /v2/info endpoint in main.ts (before the
 * Angular app is bootstrapped) and provided at the platform injector via
 * platformBrowserDynamic([...]), so the rest of the app can branch
 * synchronously between the legacy credential login and the Keycloak SSO
 * redirect.
 *
 * NB: this token deliberately has no `providedIn: 'root'` factory. A root-level
 * factory would register the token in the AppModule injector, which is a child
 * of the platform injector and would therefore shadow the platform-provided
 * value (injectors resolve child -> parent), pinning the flag to its default.
 * The only provider is the platform `useValue` set in main.ts.
 */
export const KEYCLOAK_ENABLED = new InjectionToken<boolean>('KEYCLOAK_ENABLED');
