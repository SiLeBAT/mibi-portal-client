import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, concatMap, endWith, startWith, withLatestFrom } from 'rxjs/operators';
import { DataService } from '../../core/services/data.service';
import { LogService } from '../../core/services/log.service';
import { hideBannerSOA, showBannerSOA, updateIsBusySOA } from '../../core/state/core.actions';
import { SamplesMainSlice } from '../samples.state';
import { selectSamplesMainData } from '../state/samples.selectors';
import {
    exportSamplesSSA
} from './export-samples.actions';
import { saveAs } from 'file-saver';
import { SamplesMainData } from '../state/samples.reducer';

@Injectable()
export class ExportSamplesEffects {

    constructor(
        private actions$: Actions,
        private store$: Store<SamplesMainSlice>,
        private dataService: DataService,
        private logger: LogService
    ) { }

    exportSamples$ = createEffect(() => this.actions$.pipe(
        ofType(exportSamplesSSA),
        withLatestFrom(this.store$.select(selectSamplesMainData)),
        concatMap(([, samplesMainData]) => this.exportSamples(samplesMainData).pipe(
            startWith(
                updateIsBusySOA({ isBusy: true }),
                hideBannerSOA()
            ),
            endWith(
                updateIsBusySOA({ isBusy: false })
            )
        ))
    ));

    private exportSamples(samplesMainData: SamplesMainData): Observable<Action> {
        return this.dataService.marshalJSON(samplesMainData).pipe(
            concatMap(marshalledData => {
                saveAs(this.b64toBlob(marshalledData.binaryData, marshalledData.mimeType), marshalledData.fileName);
                return EMPTY;
            }),
            catchError((error) => {
                this.logger.error('Failed to export Excel File', error.stack);
                return of(showBannerSOA({ predefined: 'exportFailure' }));
            })
        );
    }

    private b64toBlob(b64Data: string, contentType: string = '', sliceSize: number = 512) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                // eslint-disable-next-line unicorn/prefer-code-point
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
}
