import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { userPaths } from '../user.paths';
import { KeycloakAuthService } from './keycloak-auth.service';

@Injectable({ providedIn: 'root' })
export class KeycloakAuthGuard {

    constructor(
        private authService: KeycloakAuthService,
        private router: Router
    ) {}

    canActivate(): Observable<boolean | UrlTree> {
        return this.authService.me().pipe(
            map(() => true),
            catchError(() => of(this.router.createUrlTree([userPaths.login])))
        );
    }
}
