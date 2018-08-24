import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IAnnotatedSampleData } from '../models/models';
import { HttpFacadeService } from '../../services/httpFacade.service';

export interface IValidationService {
    validate(data: Record<string, string>[]): Promise<IAnnotatedSampleData[]>;
}
@Injectable({
    providedIn: 'root'
})
export class ValidationService implements IValidationService {

    private _isValidating$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(private httpFacade: HttpFacadeService) { }

    get isValidating$(): Observable<boolean> {
        return this._isValidating$.asObservable();
    }

    get isValidating(): boolean {
        return this._isValidating$.getValue();
    }

    validate(data: Record<string, string>[]) {
        this._isValidating$.next(true);
        return this.httpFacade
            .validateSampleData(data).then(
                (response: IAnnotatedSampleData[]) => {
                    this._isValidating$.next(false);
                    return response;
                }
            ).catch(
                err => {
                    this._isValidating$.next(false);
                    throw err;
                }
            );
    }
}
