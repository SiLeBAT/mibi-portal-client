import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ClientError, InputChangedError, DelayLoginError, AuthorizationError, InvalidInputError } from '../model/client-error';
import { DataService } from './data.service';
import { SampleData } from '../../samples/model/sample-management.model';
import { AnnotatedSampleContainerDTO } from '../model/shared-dto.model';

@Injectable()
export class HttpErrorMapperService implements HttpInterceptor {

    constructor(public dataService: DataService) { }

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
        const dtoToData = (dto: AnnotatedSampleContainerDTO[]): SampleData[] =>
            dto.map(container => this.dataService.fromAnnotatedDTOToSampleData(container.sample));

        switch (errorResponse.error.code) {
            case 5:
                throw new InvalidInputError(dtoToData(errorResponse.error.samples), 'Invalid input error.');
            case 6:
                throw new InputChangedError(dtoToData(errorResponse.error.samples), 'Input changed error.');
            default:
                throw new ClientError('Invalid Input error.');
        }
    }
}
