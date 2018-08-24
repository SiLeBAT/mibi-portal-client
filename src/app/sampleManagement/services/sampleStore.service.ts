import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '../../services/store.service';
import { ISampleSheet, IAnnotatedSampleData } from '../models/models';

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

@Injectable()
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

    clear() {
        this.setState(INITIAL_STATE);
    }
}
