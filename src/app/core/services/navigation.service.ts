import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { from, Observable, throwError } from 'rxjs';
import { ClientError } from '../model/client-error';
import { LogService } from './log.service';

@Injectable({
    providedIn: 'root'
})
export class NavigationService {

    constructor(private router: Router, private logger: LogService) {}

    navigate(url: string): Observable<void> {
        try {
            return from(this.router.navigate([url]).then(() => {
                return;
            }).catch(error => {
                this.logger.error('Error during navigation.', error.stack);
                throw new ClientError(error);
            }));
        } catch (error) {
            this.logger.error('Unable to navigate.', error.stack);
            return throwError(new ClientError(error));
        }
    }
}
