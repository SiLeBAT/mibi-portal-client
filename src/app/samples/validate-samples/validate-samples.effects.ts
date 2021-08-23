import { Injectable } from '@angular/core';
import { validateSamplesSSA } from './validate-samples.actions';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { withLatestFrom, concatMap, catchError, startWith, map, endWith } from 'rxjs/operators';
import { DataService } from '../../core/services/data.service';
import { of, Observable } from 'rxjs';
import { showBannerSOA, updateIsBusySOA, hideBannerSOA } from '../../core/state/core.actions';
import { LogService } from '../../core/services/log.service';
import { SamplesMainSlice } from '../samples.state';
import * as _ from 'lodash';
import { selectSamplesMainData } from '../state/samples.selectors';
import { samplesUpdateSamplesSOA } from '../state/samples.actions';
import { SamplesMainData } from '../state/samples.reducer';

@Injectable()
export class ValidateSamplesEffects {

    constructor(
        private actions$: Actions,
        private dataService: DataService,
        private logger: LogService,
        private store$: Store<SamplesMainSlice>
    ) { }

    validateSamples$ = createEffect(() => this.actions$.pipe(
        ofType(validateSamplesSSA),
        withLatestFrom(this.store$.select(selectSamplesMainData)),
        concatMap(([, samplesMainData]) => this.validateSamples(samplesMainData).pipe(
            startWith(
                updateIsBusySOA({ isBusy: true }),
                hideBannerSOA()
            ),
            endWith(
                updateIsBusySOA({ isBusy: false })
            )
        ))
    ));

    private validateSamples(samplesMainData: SamplesMainData): Observable<Action> {
        return this.dataService.validateSampleData(samplesMainData).pipe(
            map(samples => samplesUpdateSamplesSOA({ samples: samples })),
            catchError((error: Error) => {
                this.logger.error('Failed to validate samples.', error.stack);
                return of(
                    showBannerSOA({ predefined: 'validationFailure' })
                );
            })
        );
    }
}
