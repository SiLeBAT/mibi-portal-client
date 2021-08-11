import { ReceiveAs, Sample, SampleSubmission } from '../model/sample-management.model';
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
    SendSamplesSSA
} from './state/send-samples.actions';
import { SamplesSlice, SamplesMainSlice } from '../samples.state';
import { Store } from '@ngrx/store';
import { withLatestFrom, map, catchError, concatMap, startWith, endWith, first } from 'rxjs/operators';
import { SamplesMainAction, UpdateSamplesSOA } from '../state/samples.actions';
import { ShowBannerSOA, UpdateIsBusySOA, HideBannerSOA, CoreMainAction } from '../../core/state/core.actions';
import { Observable, of, EMPTY, concat } from 'rxjs';
import { SendSamplesState } from './state/send-samples.reducer';
import * as _ from 'lodash';
import { selectImportedFileName, selectSampleData, selectMetaData, selectSamplesMainData, selectHasErrors, selectHasAutoCorrections } from '../state/samples.selectors';
import { LogService } from '../../core/services/log.service';
import { DataService } from '../../core/services/data.service';
import { AuthorizationError } from '../../core/model/client-error';
import { LogoutUserMSA, UserMainAction } from '../../user/state/user.actions';
import { InvalidInputError, InputChangedError } from '../../core/model/data-service-error';
import { DialogService } from '../../shared/dialog/dialog.service';
import { SendDialogComponent } from './components/send-dialog.component';
import { AnalysisStepperComponent } from './components/analysis-stepper.component';
import { SamplesMainData } from '../state/samples.reducer';

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
    sendSamples$: Observable<SamplesMainAction | CoreMainAction> = this.actions$.pipe(
        ofType<SendSamplesSSA>(SendSamplesActionTypes.SendSamplesSSA),
        withLatestFrom(this.store$.select(selectSamplesMainData)),
        concatMap(([, samplesMainData]) => this.sendSamples(samplesMainData).pipe(
            startWith(
                new UpdateIsBusySOA({ isBusy: true }),
                new HideBannerSOA()
            ),
            endWith(
                new UpdateIsBusySOA({ isBusy: false })
            )
        ))
    );

    // Analysis dialog

    @Effect()
    sendSamplesCancelAnalysis$: Observable<CoreMainAction> = this.actions$.pipe(
        ofType<SendSamplesCancelAnalysisSSA>(SendSamplesActionTypes.SendSamplesCancelAnalysisSSA),
        map(() => new ShowBannerSOA({ predefined: 'sendCancel' }))
    );

    @Effect()
    sendSamplesConfirmAnalysis$: Observable<never> = this.actions$.pipe(
        ofType<SendSamplesConfirmAnalysisSSA>(SendSamplesActionTypes.SendSamplesConfirmAnalysisSSA),
        concatMap(() => {
            this.dialogService.openDialog(SendDialogComponent);
            return EMPTY;
        })
    );

    // Send dialog

    @Effect()
    sendSamplesCancelSend$: Observable<never> = this.actions$.pipe(
        ofType<SendSamplesCancelSendSSA>(SendSamplesActionTypes.SendSamplesCancelSendSSA),
        withLatestFrom(this.store$.select(selectSampleData)),
        concatMap(([, samples]) => {
            this.openAnalysisDialog(samples);
            return EMPTY;
        })
    );

    @Effect()
    sendSamplesConfirmSend$: Observable<SendSamplesAction | SamplesMainAction | UserMainAction | CoreMainAction> = this.actions$.pipe(
        ofType<SendSamplesConfirmSendSSA>(SendSamplesActionTypes.SendSamplesConfirmSendSSA),
        withLatestFrom(this.store$),
        concatMap(([action, state]) => this.sendSamplesSend(
            selectImportedFileName(state),
            {
                order: {
                    samples: selectSampleData(state),
                    meta: selectMetaData(state)
                },
                comment: action.payload.comment,
                receiveAs: ReceiveAs.PDF
            }
        ).pipe(
            startWith(new UpdateIsBusySOA({ isBusy: true })),
            endWith(new UpdateIsBusySOA({ isBusy: false }))
        ))
    );

    // Pipes

    private sendSamples(samplesMainData: SamplesMainData): Observable<SamplesMainAction | CoreMainAction> {
        return this.dataService.validateSampleData(samplesMainData).pipe(
            concatMap(samples => concat(
                of(new UpdateSamplesSOA(samples)),
                this.sendSamplesOpenAnalysis()
            )),
            catchError((error: Error) => {
                this.logger.error('Failed to validate samples.', error.stack);
                return of(new ShowBannerSOA({ predefined: 'validationFailure' }));
            })
        );
    }

    private sendSamplesOpenAnalysis(): Observable<CoreMainAction> {
        return this.store$.pipe(
            first(),
            concatMap(state => {
                if (selectHasErrors(state)) {
                    return of(new ShowBannerSOA({ predefined: 'validationErrors' }));
                } else if (selectHasAutoCorrections(state)) {
                    return of(new ShowBannerSOA({ predefined: 'autocorrections' }));
                }
                this.openAnalysisDialog(selectSampleData(state));
                return EMPTY;
            })
        );
    }

    private sendSamplesSend(fileName: string, submission: SampleSubmission)
        : Observable<SendSamplesAction | SamplesMainAction | UserMainAction | CoreMainAction> {
        return this.dataService.sendSampleSheet(submission).pipe(
            concatMap(() => of(
                new SendSamplesAddSentFileSOA({ sentFile: fileName }),
                new ShowBannerSOA({ predefined: 'sendSuccess' })
            )),
            catchError((error: Error) => {
                this.logger.error('Failed to send samples from store', error.stack);
                if (error instanceof InvalidInputError) {
                    this.logger.warn('Send samples returned with validation errors.');
                    return of(
                        new UpdateSamplesSOA(error.samples),
                        new ShowBannerSOA({ predefined: 'validationErrors' })
                    );
                } else if (error instanceof InputChangedError) {
                    this.logger.warn('Send samples returned with auto corrections');
                    return of(
                        new UpdateSamplesSOA(error.samples),
                        new ShowBannerSOA({ predefined: 'autocorrections' })
                    );
                } else if (error instanceof AuthorizationError) {
                    return of(
                        new LogoutUserMSA(),
                        // bug => this banner is not shown due to page navigation during logout
                        new ShowBannerSOA({ predefined: 'noAuthorizationOrActivation' })
                    );
                }
                return of(new ShowBannerSOA({ predefined: 'sendFailure' }));
            })
        );
    }

    // Utility

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
