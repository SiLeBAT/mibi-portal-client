import { SampleSet, ReceiveAs, Sample } from '../model/sample-management.model';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
    SendSamplesAction,
    SendSamplesActionTypes,
    SendSamplesConfirmAnalysisSSA,
    SendSamplesAddSentFileSOA,
    SendSamplesConfirmSendSSA,
    SendSamplesCancelAnalysisSSA,
    SendSamplesCancelSendSSA,
    SendSamplesOpenAnalysisSSA,
    SendSamplesSSA,
    SendSamplesValidateSSA,
    SendSamplesSendSSA
} from './state/send-samples.actions';
import { SamplesSlice, SamplesMainSlice } from '../samples.state';
import { Store } from '@ngrx/store';
import { withLatestFrom, map, catchError, concatMap, exhaustMap } from 'rxjs/operators';
import { UpdateSamplesSOA } from '../state/samples.actions';
import { ShowBannerSOA, UpdateIsBusySOA, HideBannerSOA } from '../../core/state/core.actions';
import { Observable, of, EMPTY } from 'rxjs';
import { SendSamplesState } from './state/send-samples.reducer';
import * as _ from 'lodash';
import { selectImportedFileName, selectSampleData, selectMetaData, selectSamplesMainData, selectHasErrors, selectHasAutoCorrections } from '../state/samples.selectors';
import { LogService } from '../../core/services/log.service';
import { DataService } from '../../core/services/data.service';
import { AuthorizationError } from '../../core/model/client-error';
import { LogoutUserMSA } from '../../user/state/user.actions';
import { InvalidInputError, InputChangedError } from '../../core/model/data-service-error';
import { DialogService } from '../../shared/dialog/dialog.service';
import { SendDialogComponent } from './components/send-dialog.component';
import { AnalysisStepperComponent } from './components/analysis-stepper.component';

@Injectable()
export class SendSamplesEffects {

    constructor(
        private actions$: Actions<SendSamplesAction>,
        private store$: Store<SamplesMainSlice & SamplesSlice<SendSamplesState>>,
        private dataService: DataService,
        private logger: LogService,
        private dialogService: DialogService
    ) { }

    @Effect()
    sendSamples$: Observable<UpdateIsBusySOA | HideBannerSOA | SendSamplesValidateSSA> = this.actions$.pipe(
        ofType<SendSamplesSSA>(SendSamplesActionTypes.SendSamplesSSA),
        concatMap(() => of(
            new UpdateIsBusySOA({ isBusy: true }),
            new HideBannerSOA(),
            new SendSamplesValidateSSA()
        ))
    );

    // Validate samples

    @Effect()
    sendSamplesValidate$: Observable<UpdateSamplesSOA | UpdateIsBusySOA | SendSamplesOpenAnalysisSSA | ShowBannerSOA> = this.actions$.pipe(
        ofType<SendSamplesValidateSSA>(SendSamplesActionTypes.SendSamplesValidateSSA),
        withLatestFrom(this.store$.select(selectSamplesMainData)),
        exhaustMap(([, samplesMainData]) => this.dataService.validateSampleData(samplesMainData).pipe(
            concatMap(samples => of(
                new UpdateSamplesSOA(samples),
                new UpdateIsBusySOA({ isBusy: false }),
                new SendSamplesOpenAnalysisSSA()
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

    // Analysis dialog

    @Effect()
    sendSamplesOpenAnalysis$: Observable<ShowBannerSOA> = this.actions$.pipe(
        ofType<SendSamplesOpenAnalysisSSA>(SendSamplesActionTypes.SendSamplesOpenAnalysisSSA),
        withLatestFrom(this.store$),
        concatMap(([, state]) => {
            if (selectHasErrors(state)) {
                return of(new ShowBannerSOA({ predefined: 'validationErrors' }));
            } else if (selectHasAutoCorrections(state)) {
                return of(new ShowBannerSOA({ predefined: 'autocorrections' }));
            }
            this.openAnalysisDialog(selectSampleData(state));
            return EMPTY;
        })
    );

    @Effect()
    sendSamplesCancelAnalysis$: Observable<ShowBannerSOA> = this.actions$.pipe(
        ofType<SendSamplesCancelAnalysisSSA>(SendSamplesActionTypes.SendSamplesCancelAnalysisSSA),
        map(() => new ShowBannerSOA({ predefined: 'sendCancel' }))
    );

    @Effect({ dispatch: false })
    sendSamplesConfirmAnalysis$: Observable<void> = this.actions$.pipe(
        ofType<SendSamplesConfirmAnalysisSSA>(SendSamplesActionTypes.SendSamplesConfirmAnalysisSSA),
        map(() => {
            this.dialogService.openDialog(SendDialogComponent);
        })
    );

    // Send dialog

    @Effect({ dispatch: false })
    sendSamplesCancelSend$: Observable<void> = this.actions$.pipe(
        ofType<SendSamplesCancelSendSSA>(SendSamplesActionTypes.SendSamplesCancelSendSSA),
        withLatestFrom(this.store$.select(selectSampleData)),
        map(([, samples]) => {
            this.openAnalysisDialog(samples);
        })
    );

    @Effect()
    sendSamplesConfirmSend$: Observable<UpdateIsBusySOA | SendSamplesSendSSA> = this.actions$.pipe(
        ofType<SendSamplesConfirmSendSSA>(SendSamplesActionTypes.SendSamplesConfirmSendSSA),
        concatMap(action => of(
            new UpdateIsBusySOA({ isBusy: true }),
            new SendSamplesSendSSA({ comment: action.payload.comment })
        ))
    );

    // Send samples

    @Effect()
    sendSamplesSend$: Observable<
        UpdateIsBusySOA
        | SendSamplesAddSentFileSOA
        | ShowBannerSOA
        | UpdateSamplesSOA
        | LogoutUserMSA
    > = this.actions$.pipe(
        ofType<SendSamplesSendSSA>(SendSamplesActionTypes.SendSamplesSendSSA),
        withLatestFrom(this.store$),
        exhaustMap(([action, state]) => {
            const fileName = selectImportedFileName(state);
            const annotatedSampleSet: SampleSet = {
                samples: selectSampleData(state),
                meta: selectMetaData(state)
            };
            return this.dataService.sendSampleSheet({
                order: annotatedSampleSet,
                comment: action.payload.comment,
                receiveAs: ReceiveAs.PDF
            }).pipe(
                concatMap(() => of(
                    new UpdateIsBusySOA({ isBusy: false }),
                    new SendSamplesAddSentFileSOA({ sentFile: fileName }),
                    new ShowBannerSOA({ predefined: 'sendSuccess' })
                )),
                catchError((error: Error) => {
                    this.logger.error('Failed to send samples from store', error.stack);
                    if (error instanceof InvalidInputError) {
                        this.logger.warn('Send samples returned with validation errors.');
                        return of(
                            new UpdateIsBusySOA({ isBusy: false }),
                            new UpdateSamplesSOA(error.samples),
                            new ShowBannerSOA({ predefined: 'validationErrors' })
                        );
                    } else if (error instanceof InputChangedError) {
                        this.logger.warn('Send samples returned with auto corrections');
                        return of(
                            new UpdateIsBusySOA({ isBusy: false }),
                            new UpdateSamplesSOA(error.samples),
                            new ShowBannerSOA({ predefined: 'autocorrections' })
                        );
                    } else if (error instanceof AuthorizationError) {
                        return of(
                            new UpdateIsBusySOA({ isBusy: false }),
                            new LogoutUserMSA(),
                            // bug => this banner is not shown due to page navigation during logout
                            new ShowBannerSOA({ predefined: 'noAuthorizationOrActivation' })
                        );
                    }
                    return of(
                        new UpdateIsBusySOA({ isBusy: false }),
                        new ShowBannerSOA({ predefined: 'sendFailure' })
                    );
                })
            );
        })
    );

    private openAnalysisDialog(samples: Sample[]): void {
        const numberOfNRLs = _.uniq(samples.map(sample => sample.sampleMeta.nrl)).length;
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
    }
}
