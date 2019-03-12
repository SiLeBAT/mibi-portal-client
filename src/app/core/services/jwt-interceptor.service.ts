import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as coreActions from '../../core/state/core.actions';
import * as fromCore from '../../core/state/core.reducer';
import * as userActions from '../../user/state/user.actions';
import { Store } from '@ngrx/store';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(
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
                        this.store.dispatch(new userActions.LogoutUser());
                        this.store.dispatch(new coreActions.DisplayBanner({ predefined: 'noAuthorizationOrActivation' }));
                    }
                }
            }
        ));
    }
}
