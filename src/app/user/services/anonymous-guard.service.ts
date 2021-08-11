import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import * as userActions from '../state/user.actions';
import { Store, select } from '@ngrx/store';
import { JwtHelperService } from '@auth0/angular-jwt';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { SamplesMainSlice } from '../../samples/samples.state';
import { UserMainState } from '../state/user.reducer';
import { selectHasEntries } from '../../samples/state/samples.selectors';
import { selectCurrentUser } from '../state/user.selectors';
import { UserMainSlice } from '../user.state';
import { NavigateMSA } from '../../shared/navigate/navigate.actions';

@Injectable({
    providedIn: 'root'
})
export class AnonymousGuard implements CanActivate {

    constructor(private store$: Store<UserMainState & SamplesMainSlice & UserMainSlice>) { }

    canActivate(activated: ActivatedRouteSnapshot, snap: RouterStateSnapshot) {
        return combineLatest([
            this.store$.pipe(select(selectCurrentUser)),
            this.store$.pipe(select(selectHasEntries))
        ]).pipe(
            map(([currentUser, hasEntries]) => {
                if (currentUser) {
                    const helper = new JwtHelperService();
                    // isTokenExpired returns false if no expirationDate is set
                    const isExpired = helper.isTokenExpired(currentUser.token) || helper.getTokenExpirationDate(currentUser.token) === null;
                    if (isExpired) {
                        this.store$.dispatch(new userActions.LogoutUserMSA());
                        return isExpired;
                    }
                    if (hasEntries) {
                        this.store$.dispatch(new NavigateMSA({ url: '/samples' }));
                    } else {
                        this.store$.dispatch(new NavigateMSA({ url: '/users/profile' }));
                    }
                    return true;
                } else {
                    return true;
                }
            })
        );
    }
}
