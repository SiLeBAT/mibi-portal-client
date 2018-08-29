import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '../../shared/services/store.service';
import { ISampleSheet, IAnnotatedSampleData } from '../models/sample-management.model';

export interface ISampleStore {
    readonly hasEntries: boolean;
    readonly annotatedSampleData$: Observable<IAnnotatedSampleData[]>;
    setState(nextState: ISampleSheet): void;
    clear(): void;
}

const INITIAL_STATE: ISampleSheet = {
    entries: [],
    workSheet: null
};

@Injectable({
    providedIn: 'root'
})
export class SampleStore extends Store<ISampleSheet> implements ISampleStore {

    constructor() {
        super(INITIAL_STATE);
    }

    get annotatedSampleData$(): Observable<IAnnotatedSampleData[]> {
        return this.state$.pipe(
            map(e => e.entries)
        );
    }

    get hasEntries(): boolean {
        return this.state.entries.length > 0;
    }

    mergeValidationResponseIntoState(validationResponse: IAnnotatedSampleData[]) {

        const mergedEntries = validationResponse.map(
            (response, i) => {
                return {
                    data: response.data,
                    errors: response.errors,
                    corrections: response.corrections,
                    edits: { ...response.edits, ...this.state.entries[i].edits }
                };
            }
        );
        const newState = { ...this.state, ...{ entries: mergedEntries } };
        this.setState(
            newState
        );
    }

    clear() {
        this.setState(INITIAL_STATE);
    }
}
