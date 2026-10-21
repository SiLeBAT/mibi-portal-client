import { Injectable } from '@angular/core';
import { RedirectCommand, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { selectUserCurrentUser } from '../state/user.selectors';
import { UserMainSlice } from '../user.state';
import { UserLinkProviderService } from '../link-provider.service';
import { AUTH_GUARD_REJECTED_STATE } from '../auth-guard/auth-guard.constants';

/**
 * Accepts a route only for a user with a valid token. A rejection redirects to
 * the login page; logging out the user and showing the banner are done by
 * UserAuthGuardEffects.
 */
@Injectable({
    providedIn: 'root'
})
export class AuthGuard  {

    private jwtHelper = new JwtHelperService();

    constructor(
        private store$: Store<UserMainSlice>,
        private router: Router,
        private userLinks: UserLinkProviderService
    ) { }

    canActivate(): Observable<true | RedirectCommand> {
        return this.store$.pipe(
            select(selectUserCurrentUser),
            take(1),
            map(currentUser => {
                if (currentUser !== null && !this.isExpired(currentUser.token)) {
                    return true;
                }
                return new RedirectCommand(
                    this.router.parseUrl(this.userLinks.login),
                    { state: { [AUTH_GUARD_REJECTED_STATE]: true } }
                );
            })
        );
    }

    private isExpired(token: string): boolean {
        // isTokenExpired returns false if no expirationDate is set
        return this.jwtHelper.isTokenExpired(token) || this.jwtHelper.getTokenExpirationDate(token) === null;
    }
}
