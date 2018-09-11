import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { IAdminActivateResponseDTO } from '../../core/model/response.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminTokenValidationResolver implements Resolve<IAdminActivateResponseDTO> {

    constructor(
        private dataService: DataService) { }

    resolve(activatedRoute: ActivatedRouteSnapshot, sanp: RouterStateSnapshot): Observable<IAdminActivateResponseDTO> {
        const token = activatedRoute.params['id'];
        return this.dataService.adminActivateAccount(token);
    }
}
