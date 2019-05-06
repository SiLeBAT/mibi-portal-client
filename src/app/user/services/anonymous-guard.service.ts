import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import * as fromUser from '../state/user.reducer';
import * as fromSamples from '../../samples/state/samples.reducer';
import * as userActions from '../state/user.actions';
import { Store, select } from '@ngrx/store';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenizedUser } from '../model/user.model';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Samples } from '../../samples/samples.store';

@Injectable({
    providedIn: 'root'
})
export class AnonymousGuard implements CanActivate {

    constructor(private router: Router,
        private store: Store<fromUser.State & Samples>) { }

    canActivate(activated: ActivatedRouteSnapshot, sanp: RouterStateSnapshot) {

        return combineLatest(
            this.store.pipe(select(fromUser.getCurrentUser)),
            this.store.pipe(select(fromSamples.hasEntries))
        ).pipe(
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
