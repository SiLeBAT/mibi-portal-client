import { Injectable } from '@angular/core';
import {
    ValidateSamplesAction,
    ValidateSamplesSSA,
    ValidateSamplesActionTypes
} from './validate-samples.actions';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { withLatestFrom, concatMap, catchError, startWith, map, endWith } from 'rxjs/operators';
import { DataService } from '../../core/services/data.service';
import { of, Observable } from 'rxjs';
import { ShowBannerSOA, UpdateIsBusySOA, HideBannerSOA, CoreMainAction } from '../../core/state/core.actions';
import { LogService } from '../../core/services/log.service';
import { SamplesMainSlice } from '../samples.state';
import * as _ from 'lodash';
import { selectSamplesMainData } from '../state/samples.selectors';
import { SamplesMainAction, UpdateSamplesSOA } from '../state/samples.actions';
import { SamplesMainData } from '../state/samples.reducer';

@Injectable()
export class ValidateSamplesEffects {

    constructor(
        private actions$: Actions<ValidateSamplesAction>,
        private dataService: DataService,
        private logger: LogService,
        private store$: Store<SamplesMainSlice>
    ) { }

    @Effect()
    validateSamples$: Observable<SamplesMainAction | CoreMainAction> = this.actions$.pipe(
        ofType<ValidateSamplesSSA>(ValidateSamplesActionTypes.ValidateSamplesSSA),
        withLatestFrom(this.store$.select(selectSamplesMainData)),
        concatMap(([, samplesMainData]) => this.validateSamples(samplesMainData).pipe(
            startWith(
                new UpdateIsBusySOA({ isBusy: true }),
                new HideBannerSOA()
            ),
            endWith(
                new UpdateIsBusySOA({ isBusy: false })
            )
        ))
    );

    private validateSamples(samplesMainData: SamplesMainData): Observable<SamplesMainAction | CoreMainAction> {
        return this.dataService.validateSampleData(samplesMainData).pipe(
            map(samples => new UpdateSamplesSOA(samples)),
            catchError((error: Error) => {
                this.logger.error('Failed to validate samples.', error.stack);
                return of(
                    new ShowBannerSOA({ predefined: 'validationFailure' })
                );
            })
        );
    }
}
