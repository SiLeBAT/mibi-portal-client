import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, concatMap, endWith, startWith, withLatestFrom } from 'rxjs/operators';
import { DataService } from '../../core/services/data.service';
import { LogService } from '../../core/services/log.service';
import { CoreMainAction, HideBannerSOA, ShowBannerSOA, UpdateIsBusySOA } from '../../core/state/core.actions';
import { SamplesMainSlice } from '../samples.state';
import { selectSamplesMainData } from '../state/samples.selectors';
import {
    ExportSamplesAction,
    ExportSamplesActionTypes,
    ExportSamplesSSA
} from './export-samples.actions';
import { saveAs } from 'file-saver';
import { SamplesMainData } from '../state/samples.reducer';

@Injectable()
export class ExportSamplesEffects {

    constructor(
        private actions$: Actions<ExportSamplesAction>,
        private store$: Store<SamplesMainSlice>,
        private dataService: DataService,
        private logger: LogService
    ) { }

    @Effect()
    exportSamples$: Observable<CoreMainAction> = this.actions$.pipe(
        ofType<ExportSamplesSSA>(ExportSamplesActionTypes.ExportSamplesSSA),
        withLatestFrom(this.store$.select(selectSamplesMainData)),
        concatMap(([, samplesMainData]) => this.exportSamples(samplesMainData).pipe(
            startWith(
                new UpdateIsBusySOA({ isBusy: true }),
                new HideBannerSOA()
            ),
            endWith(
                new UpdateIsBusySOA({ isBusy: false })
            )
        ))
    );

    private exportSamples(samplesMainData: SamplesMainData): Observable<CoreMainAction> {
        return this.dataService.marshalJSON(samplesMainData).pipe(
            concatMap(marshalledData => {
                saveAs(this.b64toBlob(marshalledData.binaryData, marshalledData.mimeType), marshalledData.fileName);
                return EMPTY;
            }),
            catchError((error: Error) => {
                this.logger.error('Failed to export Excel File', error.stack);
                return of(new ShowBannerSOA({ predefined: 'exportFailure' }));
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
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
}
