import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { AlertService } from '../../core/services/alert.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService,
        private alertService: AlertService,
        private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        if (this.authService.loggedIn()) {
            return true;
        }

        // not logged in so redirect to login page with the return url
        this.alertService.error('Nicht authorisiert, bitte einloggen.');

        this.router.navigate(['/users/login']).catch(() => {
            throw new Error('Unable to navigate.');
        });
        return false;
    }
}
