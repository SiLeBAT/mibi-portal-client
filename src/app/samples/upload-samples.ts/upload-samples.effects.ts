import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, exhaustMap, withLatestFrom } from 'rxjs/operators';
import { DataService } from '../../core/services/data.service';
import { LogService } from '../../core/services/log.service';
import { NavigationService } from '../../core/services/navigation.service';
import { HideBannerSOA, ShowBannerSOA, UpdateIsBusySOA } from '../../core/state/core.actions';
import { SamplesMainSlice } from '../samples.state';
import { UpdateSampleSetSOA, UpdateSamplesSOA } from '../state/samples.actions';
import { selectSamplesMainData } from '../state/samples.selectors';
import {
    UploadSamplesAction,
    UploadSamplesActionTypes,
    UploadSamplesImportSSA,
    UploadSamplesMSA,
    UploadSamplesShowSSA,
    UploadSamplesValidateSSA
} from './upload-samples.actions';

@Injectable()
export class UploadSamplesEffects {

    constructor(
        private actions$: Actions<UploadSamplesAction>,
        private store$: Store<SamplesMainSlice>,
        private dataService: DataService,
        private navigationService: NavigationService,
        private logger: LogService
    ) { }

    @Effect()
    uploadSamples$: Observable<UpdateIsBusySOA | HideBannerSOA | UploadSamplesImportSSA> = this.actions$.pipe(
        ofType<UploadSamplesMSA>(UploadSamplesActionTypes.UploadSamplesMSA),
        concatMap(action => of(
            new UpdateIsBusySOA({ isBusy: true }),
            new HideBannerSOA(),
            new UploadSamplesImportSSA({ excelFile: action.payload.excelFile })
        ))
    );

    @Effect()
    uploadSamplesImport$: Observable<
        UpdateSampleSetSOA
        | UploadSamplesShowSSA
        | UploadSamplesValidateSSA
        | UpdateIsBusySOA
        | ShowBannerSOA
    > = this.actions$.pipe(
        ofType<UploadSamplesImportSSA>(UploadSamplesActionTypes.UploadSamplesImportSSA),
        exhaustMap(action => this.dataService.unmarshalExcel(action.payload.excelFile).pipe(
            concatMap(sampleSet => of(
                new UpdateSampleSetSOA(sampleSet),
                new UploadSamplesShowSSA(),
                new UploadSamplesValidateSSA()
            )),
            catchError((error: Error) => {
                this.logger.error('Failed to import Excel File.', error.stack);
                return of(
                    new UpdateIsBusySOA({ isBusy: false }),
                    new ShowBannerSOA({ predefined: 'uploadFailure' })
                );
            })
        ))
    );

    @Effect({ dispatch: false })
    uploadSamplesShow$: Observable<void> = this.actions$.pipe(
        ofType<UploadSamplesShowSSA>(UploadSamplesActionTypes.UploadSamplesShowSSA),
        concatMap(() => this.navigationService.navigate('/samples'))
    );

    @Effect()
    uploadSamplesValidate$: Observable<UpdateSamplesSOA | UpdateIsBusySOA | ShowBannerSOA> = this.actions$.pipe(
        ofType<UploadSamplesValidateSSA>(UploadSamplesActionTypes.UploadSamplesValidateSSA),
        withLatestFrom(this.store$.select(selectSamplesMainData)),
        exhaustMap(([, samplesMainData]) => this.dataService.validateSampleData(samplesMainData).pipe(
            concatMap(samples => of(
                new UpdateSamplesSOA(samples),
                new UpdateIsBusySOA({ isBusy: false })
            )),
            catchError((error: Error) => {
                this.logger.error('Failed to validate samples.', error.stack);
                return of(
                    new UpdateIsBusySOA({ isBusy: false }),
                    new ShowBannerSOA({ predefined: 'validationFailure' })
                );
            })
        ))
    );
}
