import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable()
export class AlertService {
    private subject = new Subject<any>();
    private keepAfterNavigationChange = false;

    constructor(private router: Router) {
        // clear alert message on route change
        this.router.events
            .pipe(filter(event => event instanceof NavigationStart))
            .subscribe((event) => {
                if (this.keepAfterNavigationChange) {
                    // only keep for a single location change
                    this.keepAfterNavigationChange = false;
                } else {
                    this.clear().catch(() => {
                        throw new Error('Unable to clear.');
                    });
                }
            });
    }

    success(message: string, keepAfterNavigationChange = false) {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({
            type: 'success',
            text: message
        });
    }

    error(message: string, keepAfterNavigationChange = false) {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({
            type: 'error',
            text: message
        });
    }

    async clear() {
        return this.subject.next();
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }

}
