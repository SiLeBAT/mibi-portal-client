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
import { ShowBannerSOA, UpdateIsBusySOA, HideBannerSOA } from '../../core/state/core.actions';
import { LogService } from '../../core/services/log.service';
import { SamplesMainSlice } from '../samples.state';
import * as _ from 'lodash';
import { selectSamplesMainData } from '../state/samples.selectors';
import { UpdateSamplesSOA } from '../state/samples.actions';
import { UserSlice } from '../../user/user.state';
import { UserMainState } from '../../user/state/user.reducer';
import { selectCurrentUser } from '../../user/state/user.selectors';
import { AuthorizationError } from '../../core/model/client-error';
import { CheckAuthMSA } from '../../user/state/user.actions';

@Injectable()
export class ValidateSamplesEffects {

    constructor(
        private actions$: Actions<ValidateSamplesAction>,
        private dataService: DataService,
        private logger: LogService,
        private store$: Store<SamplesMainSlice & UserSlice<UserMainState>>
    ) { }

    @Effect()
    validateSamples$: Observable<UpdateSamplesSOA | ShowBannerSOA | UpdateIsBusySOA | CheckAuthMSA> = this.actions$.pipe(
        ofType<ValidateSamplesMSA>(ValidateSamplesActionTypes.ValidateSamplesMSA),
        withLatestFrom(this.store$),
        tap(() => {
            this.store$.dispatch(new UpdateIsBusySOA({ isBusy: true }));
            this.store$.dispatch(new HideBannerSOA());
        }),
        concatMap(([, state]) => {
            const sampleData = selectSamplesMainData(state);
            const curUser = selectCurrentUser(state);
            const userId = curUser !== null && curUser.id !== '' ? curUser.id : null;
            return this.dataService.validateSampleData(sampleData, userId).pipe(
                map((annotatedSamples: Sample[]) => {
                    return of(
                        new UpdateIsBusySOA({ isBusy: false }),
                        new UpdateSamplesSOA(annotatedSamples)
                    );
                }),
                concatAll(),
                catchError((error) => {
                    this.logger.error('Failed to validate samples', error);
                    if (error instanceof AuthorizationError) {
                        return of(
                            new UpdateIsBusySOA({ isBusy: false }),
                            new CheckAuthMSA(),
                            new ShowBannerSOA({ predefined: 'noAuthorizationOrActivation' })
                        );
                    }
                    return of(
                        new UpdateIsBusySOA({ isBusy: false }),
                        new ShowBannerSOA({ predefined: 'validationFailure' })
                    );
                })
            );
        })
    );
}
