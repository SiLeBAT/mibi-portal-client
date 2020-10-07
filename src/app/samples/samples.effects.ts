import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { saveAs } from 'file-saver';
import 'moment/locale/de';
import * as _ from 'lodash';
import { map, catchError, exhaustMap, withLatestFrom, mergeMap, concatAll, tap } from 'rxjs/operators';
import { SampleSet, MarshalledData } from './model/sample-management.model';
import { from, of, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { DataService } from '../core/services/data.service';
import { LogService } from '../core/services/log.service';
import { ClientError } from '../core/model/client-error';
import { SamplesMainSlice } from './samples.state';
import {
    SamplesMainAction,
    ImportExcelFileMSA,
    SamplesMainActionTypes,
    UpdateSampleSetSOA,
    ExportExcelFileSSA,
    ShowSamplesSSA
} from './state/samples.actions';
import { ValidateSamplesMSA } from './validate-samples/validate-samples.actions';
import { SamplesMainData } from './state/samples.reducer';
import { selectSamplesMainData } from './state/samples.selectors';
import { UpdateIsBusySOA, ShowBannerSOA, HideBannerSOA } from '../core/state/core.actions';

@Injectable()
export class SamplesMainEffects {

    constructor(
        private actions$: Actions<SamplesMainAction>,
        private dataService: DataService,
        private router: Router,
        private logger: LogService,
        private store$: Store<SamplesMainSlice>
    ) { }

    // ImportExcelFile

    @Effect()
    importExcelFile$: Observable<UpdateSampleSetSOA | ShowSamplesSSA | ShowBannerSOA | UpdateIsBusySOA> = this.actions$.pipe(
        ofType<ImportExcelFileMSA>(SamplesMainActionTypes.ImportExcelFileMSA),
        tap(() => {
            this.store$.dispatch(new UpdateIsBusySOA({ isBusy: true }));
            this.store$.dispatch(new HideBannerSOA());
        }),
        exhaustMap((action) => {
            return from(this.dataService.unmarshalExcel(action.payload)).pipe(
                map((unmarshalledResponse: SampleSet) => {
                    return of(
                        new UpdateIsBusySOA({ isBusy: false }),
                        new UpdateSampleSetSOA(unmarshalledResponse),
                        new ShowSamplesSSA()
                    );
                }),
                concatAll(),
                catchError((error) => {
                    this.logger.error(`Failed to import Excel File. error=${error}`);
                    return of(
                        new UpdateIsBusySOA({ isBusy: false }),
                        new ShowBannerSOA({ predefined: 'uploadFailure' })
                    );
                })
            );
        })
    );

    @Effect()
    showSamples$: Observable<ValidateSamplesMSA> = this.actions$.pipe(
        ofType<ShowSamplesSSA>(SamplesMainActionTypes.ShowSamplesSSA),
        map(() => {
            this.router.navigate(['/samples']).catch(() => {
                throw new ClientError('Unable to navigate.');
            });
            return new ValidateSamplesMSA();
        })
    );

    // ExportExcelFile

    @Effect()
    exportExcelFile$: Observable<ShowBannerSOA | UpdateIsBusySOA> = this.actions$.pipe(
        ofType<ExportExcelFileSSA>(SamplesMainActionTypes.ExportExcelFileSSA),
        withLatestFrom(this.store$),
        tap(() => {
            this.store$.dispatch(new UpdateIsBusySOA({ isBusy: true }));
            this.store$.dispatch(new HideBannerSOA());
        }),
        mergeMap(([, state]) => {
            const marshalData: SamplesMainData = selectSamplesMainData(state);
            return from(this.dataService.marshalJSON(marshalData)).pipe(
                map((marshalledData: MarshalledData) => {
                    saveAs(this.b64toBlob(marshalledData.binaryData, marshalledData.mimeType), marshalledData.fileName);
                    return new UpdateIsBusySOA({ isBusy: false });
                }),
                catchError((error) => {
                    this.logger.error('Failed to export Excel File', error);
                    return of(
                        new UpdateIsBusySOA({ isBusy: false }),
                        new ShowBannerSOA({ predefined: 'exportFailure' })
                        );
                })
            );
        })
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
