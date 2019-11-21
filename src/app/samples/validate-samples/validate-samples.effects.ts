import { Injectable } from '@angular/core';
import {
    ValidateSamplesAction,
    ValidateSamplesMSA,
    ValidateSamplesActionTypes
} from './validate-samples.actions';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { withLatestFrom, concatMap, map, catchError, concatAll, tap } from 'rxjs/operators';
import { DataService } from '../../core/services/data.service';
import { Sample } from '../model/sample-management.model';
import { of, Observable } from 'rxjs';
import { DisplayBannerSOA, UpdateIsBusySOA, DestroyBannerSOA } from '../../core/state/core.actions';
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
    validateSamples$: Observable<UpdateSamplesSOA | DisplayBannerSOA | DestroyBannerSOA | UpdateIsBusySOA> = this.actions$.pipe(
        ofType<ValidateSamplesMSA>(ValidateSamplesActionTypes.ValidateSamplesMSA),
        withLatestFrom(this.store$),
        tap(() => {
            this.store$.dispatch(new UpdateIsBusySOA({ isBusy: true }));
        }),
        concatMap(([, state]) => {
            const sampleData = selectSamplesMainData(state);
            return this.dataService.validateSampleData(sampleData).pipe(
                map((annotatedSamples: Sample[]) => {
                    return of(
                        new UpdateIsBusySOA({ isBusy: false }),
                        new DestroyBannerSOA(),
                        new UpdateSamplesSOA(annotatedSamples)
                    );
                }),
                concatAll(),
                catchError((error) => {
                    this.logger.error('Failed to validate samples', error);
                    return of(
                        new UpdateIsBusySOA({ isBusy: false }),
                        new DisplayBannerSOA({ predefined: 'validationFailure' })
                    );
                })
            );
        })
    );
}
