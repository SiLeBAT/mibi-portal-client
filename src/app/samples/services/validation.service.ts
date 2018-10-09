import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SampleData, IAnnotatedSampleData } from '../model/sample-management.model';
import { DataService } from '../../core/services/data.service';
import { map } from 'rxjs/operators';

export interface IValidationService {
    validate(data: SampleData[]): Observable<IAnnotatedSampleData[]>;
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
    correctionOffer: string[];
}

interface IValidationResponseDTO {
    data: Record<string, string>;
    errors: IValidationResponseErrorCollectionDTO;
    corrections: IValidationResponseCorrectionEntryDTO[];
}

// TODO: Actionize
@Injectable({
    providedIn: 'root'
})
export class ValidationService implements IValidationService {

    private _isValidating$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(private httpFacade: DataService) { }

    get isValidating$(): Observable<boolean> {
        return this._isValidating$.asObservable();
    }

    get isValidating(): boolean {
        return this._isValidating$.getValue();
    }

    validate(data: SampleData[]) {
        this._isValidating$.next(true);
        return this.httpFacade
            .validateSampleData(data).pipe(
                map((dtoArray: IValidationResponseDTO[]) => dtoArray.map(this.fromDTO))
            );
    }

    private fromDTO(dto: IValidationResponseDTO): IAnnotatedSampleData {
        return {
            data: dto.data,
            errors: dto.errors,
            corrections: dto.corrections,
            edits: {}
        };
    }
}
