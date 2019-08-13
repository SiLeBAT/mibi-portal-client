import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import * as fromUser from '../state/user.reducer';
import * as coreActions from '../../core/state/core.actions';
import * as userActions from '../state/user.actions';
import { Store, select } from '@ngrx/store';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenizedUser } from '../model/user.model';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(
        private store: Store<fromUser.UserMainState>) { }

    canActivate(activated: ActivatedRouteSnapshot, sanp: RouterStateSnapshot) {
        return this.store.pipe(select(fromUser.selectCurrentUser)).pipe(
            map((currentUser: TokenizedUser) => {
                if (currentUser) {
                    const helper = new JwtHelperService();
                    const isExpired = !!helper.isTokenExpired(currentUser.token);

                    if (isExpired) {
                        this.store.dispatch(new userActions.LogoutUser());
                        this.store.dispatch(new coreActions.DisplayBanner({ predefined: 'loginUnauthorized' }));
                    }
                    return !isExpired;
                }
                return false;
            })
        );
    }
}
