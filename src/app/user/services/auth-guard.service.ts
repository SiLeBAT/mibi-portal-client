import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { JwtHelperService } from '@auth0/angular-jwt';
import { map } from 'rxjs/operators';
import { selectUserCurrentUser } from '../state/user.selectors';
import { UserMainSlice } from '../user.state';
import { userForceLogoutMSA } from '../state/user.actions';
import { showBannerSOA } from '../../core/state/core.actions';
import { navigateMSA } from '../../shared/navigate/navigate.actions';
import { UserLinkProviderService } from '../link-provider.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    private jwtHelper = new JwtHelperService();

    constructor(
        private store$: Store<UserMainSlice>,
        private userLinks: UserLinkProviderService
    ) { }

    canActivate(_activated: ActivatedRouteSnapshot, _snap: RouterStateSnapshot): Observable<boolean> {
        return this.store$.pipe(
            select(selectUserCurrentUser),
            map(currentUser => {
                if(currentUser !== null) {
                    if(!this.isExpired(currentUser.token)) {
                        return true;
                    }
                }
                this.store$.dispatch(userForceLogoutMSA());
                this.store$.dispatch(navigateMSA({ path: this.userLinks.login }));
                this.store$.dispatch(showBannerSOA({ predefined: 'loginUnauthorized' }));
                return false;
            })
        );
    }

    private isExpired(token: string): boolean {
        // isTokenExpired returns false if no expirationDate is set
        return this.jwtHelper.isTokenExpired(token) || this.jwtHelper.getTokenExpirationDate(token) === null;
    }
}
