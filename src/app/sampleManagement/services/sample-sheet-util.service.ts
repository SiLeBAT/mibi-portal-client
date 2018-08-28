import { Injectable } from '@angular/core';
import { ISampleSheet } from '../models/sample-management.model';

@Injectable({
    providedIn: 'root'
})
export class SampleSheetUtilService {

    constructor() {
    }

    hasErrors(sampleSheet: ISampleSheet): number {
        return sampleSheet.entries.reduce(
            (acc, entry) => {
                let count = 0;
                for (const err of Object.keys(entry.errors)) {
                    count += entry.errors[err].filter(
                        e => e.level === 2
                    ).length;
                }
                return acc += count;
            },
            0
        );
    }
}
