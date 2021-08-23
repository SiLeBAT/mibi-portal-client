import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenizedUser } from '../model/user.model';
import { map } from 'rxjs/operators';
import { selectUserCurrentUser } from '../state/user.selectors';
import { UserMainSlice } from '../user.state';
import { userForceLogoutMSA } from '../state/user.actions';
import { showBannerSOA } from '../../core/state/core.actions';
import { navigateMSA } from '../../shared/navigate/navigate.actions';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private store$: Store<UserMainSlice>) { }

    canActivate(activated: ActivatedRouteSnapshot, snap: RouterStateSnapshot) {
        return this.store$.pipe(select(selectUserCurrentUser)).pipe(
            map((currentUser: TokenizedUser) => {
                if (currentUser) {
                    const helper = new JwtHelperService();
                    // isTokenExpired returns false if no expirationDate is set
                    const isExpired = helper.isTokenExpired(currentUser.token) || helper.getTokenExpirationDate(currentUser.token) === null;

                    if (isExpired) {
                        this.store$.dispatch(userForceLogoutMSA());
                        this.store$.dispatch(showBannerSOA({ predefined: 'loginUnauthorized' }));
                    }
                    return !isExpired;
                }
                this.store$.dispatch(navigateMSA({ url: '/users/login' }));
                return false;
            })
        );
    }
}
