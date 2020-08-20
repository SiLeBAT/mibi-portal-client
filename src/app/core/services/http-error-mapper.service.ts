import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ClientError, DelayLoginError, AuthorizationError, EndpointError } from '../model/client-error';

@Injectable()
export class HttpErrorMapperService implements HttpInterceptor {

    intercept(req: HttpRequest<any>,
        next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(req).pipe(
            catchError((errorResponse: Error) => {
                if (errorResponse instanceof HttpErrorResponse) {
                    switch (errorResponse.status) {
                        case 401:
                            this.handle401(errorResponse);
                            break;
                        case 422:
                            this.handle422(errorResponse);
                            break;
                        default:
                    }
                }
                throw errorResponse;
            }));
    }

    private handle401(errorResponse: HttpErrorResponse) {
        switch (errorResponse.error.code) {
            case 3:
                if (errorResponse.error.waitTime) {
                    throw new DelayLoginError(errorResponse.error.waitTime, 'Delay login error.');
                }
                throw new AuthorizationError('Authorization error.');
            default:
                throw new AuthorizationError('Authorization error.');
        }
    }

    private handle422(errorResponse: HttpErrorResponse) {
        switch (errorResponse.error.code) {
            case 5:
            case 6:
                throw new EndpointError(errorResponse.error, 'Invalid Input error.');
            default:
                throw new ClientError('Invalid Input error.');
        }
    }
}
