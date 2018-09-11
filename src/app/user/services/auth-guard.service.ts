import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import * as fromUser from '../state/user.reducer';
import * as coreActions from '../../core/state/core.actions';
import { Store } from '@ngrx/store';
import { AlertType } from '../../core/model/alert.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { DataService } from '../../core/services/data.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private router: Router,
        private store: Store<fromUser.IState>,
        private dataService: DataService) { }

    canActivate(activated: ActivatedRouteSnapshot, sanp: RouterStateSnapshot) {
        const currentUser = this.dataService.getCurrentUser();
        if (currentUser) {
            const helper = new JwtHelperService();
            const isExpired = !!helper.isTokenExpired(currentUser.token);

            if (isExpired) {
                this.store.dispatch(new coreActions.DisplayAlert({
                    message: 'Nicht authorisiert, bitte einloggen.',
                    type: AlertType.ERROR
                }));
                this.router.navigate(['/users/login']).catch(() => {
                    throw new Error('Unable to navigate.');
                });
            }
            return !isExpired;
        }
        return false;
    }
}
