import { SampleSet, ReceiveAs } from '../model/sample-management.model';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
    SendSamplesAction,
    SendSamplesActionTypes,
    SendSamplesOpenSendDialogSSA,
    SendSamplesAddSentFileSOA,
    SendSamplesSSA
} from './state/send-samples.actions';
import { SamplesSlice, SamplesMainSlice } from '../samples.state';
import { Store } from '@ngrx/store';
import { withLatestFrom, map, concatAll, catchError, tap } from 'rxjs/operators';
import { SamplesMainAction, UpdateSamplesSOA } from '../state/samples.actions';
import { ShowBannerSOA, UpdateIsBusySOA, DestroyBannerSOA } from '../../core/state/core.actions';
import { Observable, of, from } from 'rxjs';
import { SendSamplesState } from './state/send-samples.reducer';
import * as _ from 'lodash';
import { selectImportedFileName, selectFormData, selectMetaData } from '../state/samples.selectors';
import { LogService } from '../../core/services/log.service';
import { DataService } from '../../core/services/data.service';
import { AuthorizationError } from '../../core/model/client-error';
import { LogoutUserMSA } from '../../user/state/user.actions';
import { InvalidInputError, InputChangedError } from '../../core/model/data-service-error';
import { DialogService } from '../../shared/dialog/dialog.service';
import { SendDialogComponent } from './components/send-dialog.component';
import { AnalysisStepperComponent } from '../analysis-stepper/components/analysis-stepper.component';
import { SendSamplesOpenAnalysisDialogSSA, AnalysisStepperActionTypes } from '../analysis-stepper/state/analysis-stepper.actions';

@Injectable()
export class SendSamplesEffects {

    constructor(
        private actions$: Actions<SendSamplesAction | SamplesMainAction>,
        private store$: Store<SamplesMainSlice & SamplesSlice<SendSamplesState>>,
        private dataService: DataService,
        private logger: LogService,
        private dialogService: DialogService
    ) { }

    @Effect({ dispatch: false })
    openSendDialog$: Observable<void> = this.actions$.pipe(
        ofType<SendSamplesOpenSendDialogSSA>(SendSamplesActionTypes.OpenSendDialogSSA),
        map(() => {
            this.dialogService.openDialog(SendDialogComponent);
        })
    );

    @Effect({ dispatch: false })
    openAnalysisStepperDialog$: Observable<void> = this.actions$.pipe(
        ofType<SendSamplesOpenAnalysisDialogSSA>(AnalysisStepperActionTypes.OpenAnalysisStepperSSA),
        withLatestFrom(this.store$),
        map(([, state]) => {
            const numberOfNRLs = _.uniq(selectFormData(state).map(d => d.sampleMeta.nrl)).length;
            let width = '50%';
            if (numberOfNRLs > 5) {
                width = '65%';
            }
            if (numberOfNRLs > 9) {
                width = '80%';
            }
            this.dialogService.openDialog(AnalysisStepperComponent, {
                width: width,
                panelClass: 'mibi-stepper-dialog-container'
            });
        })
    );

    @Effect()
    sendSamples$: Observable<
        ShowBannerSOA
        | UpdateSamplesSOA
        | SendSamplesAddSentFileSOA
        | LogoutUserMSA
        | DestroyBannerSOA
        | UpdateIsBusySOA
    > = this.actions$.pipe(
        ofType<SendSamplesSSA>(SendSamplesActionTypes.SendSamplesSSA),
        withLatestFrom(this.store$),
        tap(() => {
            this.store$.dispatch(new UpdateIsBusySOA({ isBusy: true }));
        }),
        map(([action, state]) => {
            const fileName = selectImportedFileName(state);
            const annotatedSampleSet: SampleSet = {
                samples: selectFormData(state),
                meta: selectMetaData(state)
            };
            return from(this.dataService.sendSampleSheet({
                order: annotatedSampleSet,
                comment: action.payload.comment,
                receiveAs: ReceiveAs.PDF
            })).pipe(
                map(() => of(
                    new UpdateIsBusySOA({ isBusy: false }),
                    new SendSamplesAddSentFileSOA({ sentFile: fileName }),
                    new ShowBannerSOA({ predefined: 'sendSuccess' })
                )),
                concatAll(),
                catchError((error) => {
                    this.logger.error('Failed to send samples from store', error);
                    if (error instanceof InvalidInputError) {
                        return of(
                            new UpdateIsBusySOA({ isBusy: false }),
                            new UpdateSamplesSOA(error.samples),
                            new DestroyBannerSOA(),
                            new ShowBannerSOA({ predefined: 'validationErrors' })
                        );
                    } else if (error instanceof InputChangedError) {
                        return of(
                            new UpdateIsBusySOA({ isBusy: false }),
                            new UpdateSamplesSOA(error.samples),
                            new DestroyBannerSOA(),
                            new ShowBannerSOA({ predefined: 'autocorrections' })
                        );
                    } else if (error instanceof AuthorizationError) {
                        return of(
                            new UpdateIsBusySOA({ isBusy: false }),
                            new LogoutUserMSA(),
                            new ShowBannerSOA({ predefined: 'noAuthorizationOrActivation' })
                        );
                    }
                    return of(
                        new UpdateIsBusySOA({ isBusy: false }),
                        new ShowBannerSOA({ predefined: 'sendFailure' })
                    );
                })
            );
        }),
        concatAll()
    );
}
