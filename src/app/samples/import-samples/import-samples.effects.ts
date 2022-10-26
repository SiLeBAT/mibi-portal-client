import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { concat, Observable, of } from 'rxjs';
import { catchError, concatMap, endWith, first, map, startWith } from 'rxjs/operators';
import { DataService } from '../../core/services/data.service';
import { LogService } from '../../core/services/log.service';
import { hideBannerSOA, showBannerSOA, updateIsBusySOA } from '../../core/state/core.actions';
import { navigateMSA } from '../../shared/navigate/navigate.actions';
import { ExcelFile } from '../model/sample-management.model';
import { SamplesLinkProviderService } from '../link-provider.service';
import { SamplesMainSlice } from '../samples.state';
import { samplesUpdateMainDataSOA, samplesUpdateSamplesSOA } from '../state/samples.actions';
import { selectSamplesMainData } from '../state/samples.selectors';
import {
    importSamplesMSA
} from './import-samples.actions';

@Injectable()
export class ImportSamplesEffects {

    constructor(
        private actions$: Actions,
        private store$: Store<SamplesMainSlice>,
        private dataService: DataService,
        private logger: LogService,
        private samplesLinks: SamplesLinkProviderService
    ) { }

    importSamples$ = createEffect(() => this.actions$.pipe(
        ofType(importSamplesMSA),
        concatMap(action => this.importSamples(action.excelFile).pipe(
            startWith(
                updateIsBusySOA({ isBusy: true }),
                hideBannerSOA()
            ),
            endWith(
                updateIsBusySOA({ isBusy: false })
            )
        ))
    ));

    private importSamples(excelFile: ExcelFile): Observable<Action> {
        return this.dataService.unmarshalExcel(excelFile).pipe(
            concatMap(sampleSet => concat(
                of(
                    samplesUpdateMainDataSOA({ sampleSet: sampleSet }),
                    navigateMSA({ path: this.samplesLinks.editor })
                ),
                this.importSamplesValidate()
            )),
            catchError((error) => {
                this.logger.error('Failed to import Excel File.', error.stack);
                return of(showBannerSOA({ predefined: 'uploadFailure' }));
            })
        );
    }

    private importSamplesValidate(): Observable<Action> {
        return this.store$.select(selectSamplesMainData).pipe(
            first(),
            concatMap(samplesMainData => this.dataService.validateSampleData(samplesMainData).pipe(
                map(samples => samplesUpdateSamplesSOA({ samples: samples })),
                catchError((error) => {
                    this.logger.error('Failed to validate samples.', error.stack);
                    return of(showBannerSOA({ predefined: 'validationFailure' }));
                })
            ))
        );
    }
}
