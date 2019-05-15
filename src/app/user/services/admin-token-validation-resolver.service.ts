import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { Observable } from 'rxjs';
import { ActivationResponse } from '../model/user.model';

@Injectable({
    providedIn: 'root'
})
export class AdminTokenValidationResolver implements Resolve<ActivationResponse> {

    constructor(
        private dataService: DataService) { }

    resolve(activatedRoute: ActivatedRouteSnapshot, sanp: RouterStateSnapshot): Observable<ActivationResponse> {
        const token = activatedRoute.params['id'];
        return this.dataService.activateAccount(token);
    }
}
