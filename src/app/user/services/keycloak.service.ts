import { Injectable } from '@angular/core';
import Keycloak, { KeycloakInstance } from 'keycloak-js';

@Injectable({
    providedIn: 'root'
})
export class KeycloakService {
    private keycloak!: KeycloakInstance;

    async init(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.keycloak = new Keycloak({
                url: 'http://localhost:8080/', // your Keycloak server
                realm: 'mibi',
                clientId: 'public-client-parse'     // must match Keycloak client ID
            });

            this.keycloak.init({
                onLoad: 'check-sso',
                silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
                pkceMethod: 'S256'
            }).then((authenticated: boolean | PromiseLike<boolean>) => {
                resolve(authenticated);
            }).catch((err: Error) => {
                reject(err);
            });
        });
    }

    login(): void {
        this.keycloak.login();
    }

    logout(): void {
        this.keycloak.logout({ redirectUri: window.location.origin });
    }

    getToken(): string | undefined {
        return this.keycloak.token;
    }

    isLoggedIn(): boolean {
        return !!this.keycloak?.token;
    }

    getUsername(): string | undefined {
        return this.keycloak?.tokenParsed?.preferred_username;
    }
}
