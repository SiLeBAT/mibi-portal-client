import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
    SendSamplesFromStoreAction,
    SendSamplesFromStore,
    SendSamplesFromStoreActionTypes,
    SendSamplesFromStoreSuccess,
    SendSamplesFromStoreFailure,
    SendSamplesFromStoreNoUser
} from './send-samples-from-store.actions';
import { withLatestFrom, mergeMap, catchError, map, concatAll } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { from, of, Observable } from 'rxjs';
import { SendSamplesService } from '../services/send-samples.service';
import { LogService } from '../../../core/services/log.service';
import { SamplesSlice } from '../../samples.state';
import { selectSamplesMainData } from '../../state/samples.reducer';
import { DisplayBanner } from '../../../core/state/core.actions';
import { Samples } from '../../samples.store';
import { getCurrentUser } from '../../../user/state/user.reducer';

@Injectable()
export class SendSamplesFromStoreEffects {

    constructor(
        private actions$: Actions<SendSamplesFromStoreAction>,
        private sendSampleService: SendSamplesService,
        private logger: LogService,
        private store$: Store<Samples>
    ) { }

    @Effect()
    sendSamplesFromStore$: Observable<
    SendSamplesFromStoreSuccess
    | SendSamplesFromStoreNoUser
    | SendSamplesFromStoreFailure
    > = this.actions$.pipe(
        ofType<SendSamplesFromStore>(SendSamplesFromStoreActionTypes.SendSamplesFromStore),
        withLatestFrom(this.store$),
        map(([action, state]) => {
            const currentUser = getCurrentUser(state);
            if (!currentUser) {
                return of(new SendSamplesFromStoreNoUser());
            } else {
                const filenameAddon = '_validated';
                const sampleData = selectSamplesMainData(state);
                return from(this.sendSampleService.sendData(
                    {
                        formData: sampleData.formData,
                        fileDetails: sampleData.fileDetails
                    },
                    filenameAddon,
                    currentUser,
                    action.payload.comment,
                    sampleData.nrl)).pipe(
                        map(() => new SendSamplesFromStoreSuccess()),
                        catchError((error) => {
                            this.logger.error('Failed to send samples from store', error);
                            return of(
                                new SendSamplesFromStoreFailure()
                            );
                        })
                    );
            }
        }),
        concatAll()
    );
}
