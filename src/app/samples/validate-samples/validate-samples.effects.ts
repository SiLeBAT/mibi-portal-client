import { Injectable } from '@angular/core';
import {
    ValidateSamplesAction,
    ValidateSamplesSSA,
    ValidateSamplesActionTypes,
    ValidateSamplesValidateSSA
} from './validate-samples.actions';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { withLatestFrom, concatMap, catchError, exhaustMap } from 'rxjs/operators';
import { DataService } from '../../core/services/data.service';
import { of, Observable } from 'rxjs';
import { ShowBannerSOA, UpdateIsBusySOA, HideBannerSOA } from '../../core/state/core.actions';
import { LogService } from '../../core/services/log.service';
import { SamplesMainSlice } from '../samples.state';
import * as _ from 'lodash';
import { selectSamplesMainData } from '../state/samples.selectors';
import { UpdateSamplesSOA } from '../state/samples.actions';

@Injectable()
export class ValidateSamplesEffects {

    constructor(
        private actions$: Actions<ValidateSamplesAction>,
        private dataService: DataService,
        private logger: LogService,
        private store$: Store<SamplesMainSlice>
    ) { }

    @Effect()
    validateSamples$: Observable<UpdateIsBusySOA | HideBannerSOA | ValidateSamplesValidateSSA> = this.actions$.pipe(
        ofType<ValidateSamplesSSA>(ValidateSamplesActionTypes.ValidateSamplesSSA),
        concatMap(() => of(
            new UpdateIsBusySOA({ isBusy: true }),
            new HideBannerSOA(),
            new ValidateSamplesValidateSSA()
        ))
    );

    @Effect()
    validateSamplesValidate$: Observable<UpdateSamplesSOA | UpdateIsBusySOA | ShowBannerSOA> = this.actions$.pipe(
        ofType<ValidateSamplesValidateSSA>(ValidateSamplesActionTypes.ValidateSamplesValidateSSA),
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
