import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { JwtHelperService } from '@auth0/angular-jwt';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { SamplesMainSlice } from '../../samples/samples.state';
import { UserMainState } from '../state/user.reducer';
import { selectHasEntries } from '../../samples/state/samples.selectors';
import { selectUserCurrentUser } from '../state/user.selectors';
import { UserMainSlice } from '../user.state';
import { userForceLogoutMSA } from '../state/user.actions';
import { navigateMSA } from '../../shared/navigate/navigate.actions';
import { SamplesLinkProviderService } from '../../samples/link-provider.service';

@Injectable({
    providedIn: 'root'
})
export class AnonymousGuard implements CanActivate {

    constructor(
        private store$: Store<UserMainState & SamplesMainSlice & UserMainSlice>,
        private samplesLinks: SamplesLinkProviderService
    ) { }

    canActivate(_activated: ActivatedRouteSnapshot, _snap: RouterStateSnapshot) {
        return combineLatest([
            this.store$.pipe(select(selectUserCurrentUser)),
            this.store$.pipe(select(selectHasEntries))
        ]).pipe(
            map(([currentUser, hasEntries]) => {
                if (currentUser) {
                    const helper = new JwtHelperService();
                    // isTokenExpired returns false if no expirationDate is set
                    const isExpired = helper.isTokenExpired(currentUser.token) || helper.getTokenExpirationDate(currentUser.token) === null;
                    if (isExpired) {
                        this.store$.dispatch(userForceLogoutMSA());
                        return isExpired;
                    }
                    if (hasEntries) {
                        this.store$.dispatch(navigateMSA({ path: this.samplesLinks.editor }));
                    } else {
                        this.store$.dispatch(navigateMSA({ path: this.samplesLinks.upload }));
                    }
                    return true;
                } else {
                    return true;
                }
            })
        );
    }
}
