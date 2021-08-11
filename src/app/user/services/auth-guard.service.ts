import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import * as coreActions from '../../core/state/core.actions';
import * as userActions from '../state/user.actions';
import { Store, select } from '@ngrx/store';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenizedUser } from '../model/user.model';
import { map } from 'rxjs/operators';
import { selectCurrentUser } from '../state/user.selectors';
import { UserMainSlice } from '../user.state';
import { NavigateMSA } from '../../shared/navigate/navigate.actions';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private store$: Store<UserMainSlice>) { }

    canActivate(activated: ActivatedRouteSnapshot, snap: RouterStateSnapshot) {
        return this.store$.pipe(select(selectCurrentUser)).pipe(
            map((currentUser: TokenizedUser) => {
                if (currentUser) {
                    const helper = new JwtHelperService();
                    // isTokenExpired returns false if no expirationDate is set
                    const isExpired = helper.isTokenExpired(currentUser.token) || helper.getTokenExpirationDate(currentUser.token) === null;

                    if (isExpired) {
                        this.store$.dispatch(new userActions.LogoutUserMSA());
                        this.store$.dispatch(new coreActions.ShowBannerSOA({ predefined: 'loginUnauthorized' }));
                    }
                    return !isExpired;
                }
                this.store$.dispatch(new NavigateMSA({ url: '/users/login' }));
                return false;
            })
        );
    }
}
