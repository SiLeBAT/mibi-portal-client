import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import * as fromUser from '../state/user.reducer';
import * as coreActions from '../../core/state/core.actions';
import { Store, select } from '@ngrx/store';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenizedUser } from '../model/user.model';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private router: Router,
        private store: Store<fromUser.IState>) { }

    canActivate(activated: ActivatedRouteSnapshot, sanp: RouterStateSnapshot) {
        return this.store.pipe(select(fromUser.getCurrentUser)).pipe(
            map((currentUser: TokenizedUser) => {
                if (currentUser) {
                    const helper = new JwtHelperService();
                    const isExpired = !!helper.isTokenExpired(currentUser.token);

                    if (isExpired) {
                        this.store.dispatch(new coreActions.DisplayBanner({ predefined: 'loginUnauthorized' }));
                        this.router.navigate(['/users/login']).catch(() => {
                            throw new Error('Unable to navigate.');
                        });
                    }
                    return !isExpired;
                }
                return false;
            })
        );
    }
}
