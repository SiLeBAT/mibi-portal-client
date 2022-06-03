import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { Observable } from 'rxjs';
import { UserActivation } from '../model/user.model';

@Injectable({
    providedIn: 'root'
})
export class AdminTokenValidationResolver implements Resolve<UserActivation> {

    constructor(
        private dataService: DataService) { }

    resolve(activatedRoute: ActivatedRouteSnapshot, _snap: RouterStateSnapshot): Observable<UserActivation> {
        const token = activatedRoute.params['id'];
        return this.dataService.activateAccount(token);
    }
}
