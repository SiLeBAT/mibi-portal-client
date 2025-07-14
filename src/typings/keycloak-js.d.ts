declare let keycloak: any;
declare module 'keycloak-js' {
    export = keycloak;
}

/*declare module 'keycloak-js' {
    interface KeycloakInitOptions {
        onLoad?: 'login-required' | 'check-sso';    // 'login-required' forces login, 'check-sso' checks SSO status
        silentCheckSsoRedirectUri?: string;  // URI for silent SSO check
        pkceMethod?: 'S256';
        enableBearerInterceptor: boolean;        // PKCE method for enhanced security
    }
    interface KeycloakTokenParsed {
        preferred_username?: string;  // Username from the token
    }
    export interface KeycloakInstance {
        tokenParsed?: KeycloakTokenParsed;  // Parsed token containing user info
        login: () => void;                   // Method to initiate login
        logout: (options?: { redirectUri?: string }) => void;  // Method to log out
        token?: string;                      // Current token
        init: (options: KeycloakInitOptions) => Promise<boolean>;  // Method to initialize Keycloak
    }
    interface KeycloakConfig {
        url: string;          // Keycloak server URL
        realm: string;       // Realm name
        clientId: string;    // Client ID
    }

}
*/
