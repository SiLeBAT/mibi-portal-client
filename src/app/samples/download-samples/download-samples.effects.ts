import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, exhaustMap, map, withLatestFrom } from 'rxjs/operators';
import { DataService } from '../../core/services/data.service';
import { LogService } from '../../core/services/log.service';
import { HideBannerSOA, ShowBannerSOA, UpdateIsBusySOA } from '../../core/state/core.actions';
import { SamplesMainSlice } from '../samples.state';
import { selectSamplesMainData } from '../state/samples.selectors';
import {
    DownloadSamplesAction,
    DownloadSamplesActionTypes,
    DownloadSamplesExportSSA,
    DownloadSamplesSSA
} from './download-samples.actions';
import { saveAs } from 'file-saver';

@Injectable()
export class DownloadSamplesEffects {

    constructor(
        private actions$: Actions<DownloadSamplesAction>,
        private store$: Store<SamplesMainSlice>,
        private dataService: DataService,
        private logger: LogService
    ) { }

    @Effect()
    downloadSamples$: Observable<UpdateIsBusySOA | HideBannerSOA | DownloadSamplesExportSSA> = this.actions$.pipe(
        ofType<DownloadSamplesSSA>(DownloadSamplesActionTypes.DownloadSamplesSSA),
        concatMap(() => of(
            new UpdateIsBusySOA({ isBusy: true }),
            new HideBannerSOA(),
            new DownloadSamplesExportSSA()
        ))
    );

    @Effect()
    downloadSamplesExport$: Observable<UpdateIsBusySOA | ShowBannerSOA> = this.actions$.pipe(
        ofType<DownloadSamplesExportSSA>(DownloadSamplesActionTypes.DownloadSamplesExportSSA),
        withLatestFrom(this.store$.select(selectSamplesMainData)),
        exhaustMap(([, samplesMainData]) => this.dataService.marshalJSON(samplesMainData).pipe(
            map(marshalledData => {
                saveAs(this.b64toBlob(marshalledData.binaryData, marshalledData.mimeType), marshalledData.fileName);
                return new UpdateIsBusySOA({ isBusy: false });
            }),
            catchError((error: Error) => {
                this.logger.error('Failed to export Excel File', error.stack);
                return of(
                    new UpdateIsBusySOA({ isBusy: false }),
                    new ShowBannerSOA({ predefined: 'exportFailure' })
                );
            })
        ))
    );

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
