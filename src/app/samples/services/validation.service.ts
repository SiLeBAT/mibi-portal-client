import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SampleData, IAnnotatedSampleData, ChangedValueCollection } from '../model/sample-management.model';
import { HttpFacadeService } from '../../core/services/httpFacade.service';

export interface IValidationService {
    validate(data: SampleData[]): Promise<IAnnotatedSampleData[]>;
}

interface IValidationResponseErrorEntryDTO {
    code: number;
    level: number;
    message: string;
}

interface IValidationResponseErrorCollectionDTO {
    [key: string]: IValidationResponseErrorEntryDTO[];
}

interface IValidationResponseCorrectionEntryDTO {
    field: keyof SampleData;
    original: string;
    corrected: string;
}

interface IValidationResponseDTO {
    data: Record<string, string>;
    errors: IValidationResponseErrorCollectionDTO;
    corrections: IValidationResponseCorrectionEntryDTO[];
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

    validate(data: SampleData[]) {
        this._isValidating$.next(true);
        return this.httpFacade
            .validateSampleData(data).then(
                (res: IValidationResponseDTO[]) => this.onSuccess(res)
            ).catch(err => this.onError(err));
    }

    private onSuccess(response: IValidationResponseDTO[]) {
        this._isValidating$.next(false);
        return response.map(this.fromDTO);
    }

    private fromDTO(dto: IValidationResponseDTO) {
        return {
            data: dto.data,
            errors: dto.errors,
            corrections: dto.corrections,
            edits: dto.corrections.reduce(
                (acc: ChangedValueCollection, current: IValidationResponseCorrectionEntryDTO) => {
                    acc[current.field] = current.original;
                    return acc;
                },
                {}
            )
        };
    }

    private onError(err: Error): never {
        this._isValidating$.next(false);
        throw err;
    }
}
