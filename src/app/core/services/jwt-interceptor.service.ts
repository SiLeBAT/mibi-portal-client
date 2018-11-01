import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as coreActions from '../../core/state/core.actions';
import * as fromCore from '../../core/state/core.reducer';
import { Store } from '@ngrx/store';

// TODO: This should be handled in Effects & with different actions
@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(private router: Router,
        private store: Store<fromCore.State>) { }

    intercept(req: HttpRequest<any>,
        next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(req).pipe(tap(
            () => {
                // doing nothing
            },
            (err: Error) => {
                if (err instanceof HttpErrorResponse) {
                    if (err.status === 401) {
                        this.store.dispatch(new coreActions.DisplayBanner({ predefined: 'noAuthorizationOrActivation' }));
                        this.router.navigate(['/users/login']).catch(() => {
                            throw new Error();
                        });
                    }
                }
            }
        ));
    }
}
