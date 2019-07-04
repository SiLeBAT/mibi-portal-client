import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import * as fromSamples from '../../samples/state/samples.state';
import * as userActions from '../state/user.actions';
import { Store, select } from '@ngrx/store';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenizedUser } from '../model/user.model';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Samples } from '../../samples/samples.store';
import { UserMainState } from '../state/user.state';
import { selectHasEntries } from '../../samples/state/samples.selectors';
import { selectCurrentUser } from '../state/user.selectors';

@Injectable({
    providedIn: 'root'
})
export class AnonymousGuard implements CanActivate {

    constructor(private router: Router,
        private store: Store<UserMainState & Samples>) { }

    canActivate(activated: ActivatedRouteSnapshot, sanp: RouterStateSnapshot) {

        return combineLatest([
            this.store.pipe(select(selectCurrentUser)),
            this.store.pipe(select(selectHasEntries))
        ]).pipe(
            map(([currentUser, hasEntries]) => {
                if (currentUser) {
                    const helper = new JwtHelperService();
                    const isExpired = !!helper.isTokenExpired(currentUser.token);
                    if (isExpired) {
                        this.store.dispatch(new userActions.LogoutUser());
                        return isExpired;
                    }
                    if (hasEntries) {
                        this.router.navigate(['/samples']).catch(() => {
                            throw new Error('Unable to navigate.');
                        });
                    } else {
                        this.router.navigate(['/users/profile']).catch(() => {
                            throw new Error('Unable to navigate.');
                        });
                    }
                    return true;
                } else {
                    return true;
                }
            })
        );
    }
}
