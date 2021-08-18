import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concat, Observable, of } from 'rxjs';
import { catchError, concatMap, endWith, first, map, startWith } from 'rxjs/operators';
import { DataService } from '../../core/services/data.service';
import { LogService } from '../../core/services/log.service';
import { CoreMainAction, HideBannerSOA, ShowBannerSOA, UpdateIsBusySOA } from '../../core/state/core.actions';
import { NavigateAction, NavigateMSA } from '../../shared/navigate/navigate.actions';
import { ExcelFile } from '../model/sample-management.model';
import { SamplesMainSlice } from '../samples.state';
import { SamplesMainAction, UpdateSampleSetSOA, UpdateSamplesSOA } from '../state/samples.actions';
import { selectSamplesMainData } from '../state/samples.selectors';
import {
    ImportSamplesAction,
    ImportSamplesActionTypes,
    ImportSamplesMSA
} from './import-samples.actions';

@Injectable()
export class ImportSamplesEffects {

    constructor(
        private actions$: Actions<ImportSamplesAction>,
        private store$: Store<SamplesMainSlice>,
        private dataService: DataService,
        private logger: LogService
    ) { }

    @Effect()
    importSamples$: Observable<SamplesMainAction | NavigateAction | CoreMainAction> = this.actions$.pipe(
        ofType<ImportSamplesMSA>(ImportSamplesActionTypes.ImportSamplesMSA),
        concatMap(action => this.importSamples(action.payload.excelFile).pipe(
            startWith(
                new UpdateIsBusySOA({ isBusy: true }),
                new HideBannerSOA()
            ),
            endWith(
                new UpdateIsBusySOA({ isBusy: false })
            )
        ))
    );

    private importSamples(excelFile: ExcelFile): Observable<SamplesMainAction | NavigateAction | CoreMainAction> {
        return this.dataService.unmarshalExcel(excelFile).pipe(
            concatMap(sampleSet => concat(
                of(
                    new UpdateSampleSetSOA(sampleSet),
                    new NavigateMSA({ url: '/samples' })
                ),
                this.importSamplesValidate()
            )),
            catchError((error: Error) => {
                this.logger.error('Failed to import Excel File.', error.stack);
                return of(new ShowBannerSOA({ predefined: 'uploadFailure' }));
            })
        );
    }

    private importSamplesValidate(): Observable<SamplesMainAction | CoreMainAction> {
        return this.store$.select(selectSamplesMainData).pipe(
            first(),
            concatMap(samplesMainData => this.dataService.validateSampleData(samplesMainData).pipe(
                map(samples => new UpdateSamplesSOA(samples)),
                catchError((error: Error) => {
                    this.logger.error('Failed to validate samples.', error.stack);
                    return of(new ShowBannerSOA({ predefined: 'validationFailure' }));
                })
            ))
        );
    }
}
