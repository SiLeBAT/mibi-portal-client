import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';

let keycloak: any;
@Injectable({
    providedIn: 'root'
})
export class KeycloakService {
    private keycloak!: any;

    async init(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            keycloak = new Keycloak({
                url: 'https://t-ma-keycloak-01.bfr.bund.de', // your Keycloak server
                realm: 'mibi',
                clientId: 'mibi-client',     // must match Keycloak client ID
                pkceMethod: 'S256'
            });

            keycloak.init({
                enableBearerInterceptor: true
            }).then((authenticated: boolean | PromiseLike<boolean>) => {
                // eslint-disable-next-line no-console
                console.log('Keycloak initalised successfully', authenticated);
                resolve(authenticated);
            }).catch((err: Error) => {
                // eslint-disable-next-line no-console
                console.error('Keycloak initialization failed', err);
                reject(err);
            });
        });
    }

    login(): void {
        // eslint-disable-next-line no-console
        console.log('Keycloak login called');
        // eslint-disable-next-line no-console
        console.log('Keycloak instance:', this.keycloak);
        keycloak.login();
    }

    logout(): void {
        keycloak.logout({ redirectUri: window.location.origin });
    }

    getToken(): string | undefined {
        return keycloak.token;
    }

    isLoggedIn(): boolean {
        return !!keycloak?.token;
    }

    getUsername(): string | undefined {
        return keycloak?.tokenParsed?.preferred_username;
    }
}
