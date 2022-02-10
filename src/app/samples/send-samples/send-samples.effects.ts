import { ReceiveAs, Sample, SampleSubmission } from '../model/sample-management.model';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
    sendSamplesConfirmAnalysisSSA,
    sendSamplesAddSentFileSOA,
    sendSamplesConfirmSendSSA,
    sendSamplesCancelAnalysisSSA,
    sendSamplesCancelSendSSA,
    sendSamplesSSA,
    sendSamplesUpdateDialogWarningsSOA
} from './state/send-samples.actions';
import { SamplesSlice, SamplesMainSlice } from '../samples.state';
import { Action, Store } from '@ngrx/store';
import { withLatestFrom, map, catchError, concatMap, startWith, endWith, first, finalize } from 'rxjs/operators';
import { samplesUpdateSamplesSOA } from '../state/samples.actions';
import { showBannerSOA, updateIsBusySOA, hideBannerSOA } from '../../core/state/core.actions';
import { Observable, of, EMPTY, concat } from 'rxjs';
import { SendSamplesState } from './state/send-samples.reducer';
import _ from 'lodash';
import {
    selectImportedFileName,
    selectSampleData,
    selectMetaData,
    selectSamplesMainData,
    selectHasErrors,
    selectHasAutoCorrections,
    selectHasWarnings
} from '../state/samples.selectors';
import { LogService } from '../../core/services/log.service';
import { DataService } from '../../core/services/data.service';
import { AuthorizationError } from '../../core/model/client-error';
import { userForceLogoutMSA } from '../../user/state/user.actions';
import { InvalidInputError, InputChangedError } from '../../core/model/data-service-error';
import { DialogService } from '../../shared/dialog/dialog.service';
import { SendDialogComponent } from './components/send-dialog.component';
import { AnalysisStepperComponent } from './components/analysis-stepper.component';
import { SamplesMainData } from '../state/samples.reducer';
import { DialogWarning } from '../../shared/dialog/dialog.model';
import { sendSamplesCommentWarningsStrings, sendSamplesDialogWarningsStrings } from './send-samples.constants';
import { selectSendSamplesIsFileAlreadySent } from './state/send-samples.selectors';

@Injectable()
export class SendSamplesEffects {

    constructor(
        private actions$: Actions,
        private store$: Store<SamplesMainSlice & SamplesSlice<SendSamplesState>>,
        private dataService: DataService,
        private logger: LogService,
        private dialogService: DialogService
    ) { }

    sendSamples$ = createEffect(() => this.actions$.pipe(
        ofType(sendSamplesSSA),
        withLatestFrom(this.store$.select(selectSamplesMainData)),
        concatMap(([, samplesMainData]) => this.sendSamples(samplesMainData).pipe(
            startWith(
                updateIsBusySOA({ isBusy: true }),
                hideBannerSOA()
            ),
            endWith(
                updateIsBusySOA({ isBusy: false })
            )
        ))
    ));

    // Analysis dialog

    sendSamplesCancelAnalysis$ = createEffect(() => this.actions$.pipe(
        ofType(sendSamplesCancelAnalysisSSA),
        map(() => showBannerSOA({ predefined: 'sendCancel' }))
    ));

    sendSamplesConfirmAnalysis$ = createEffect(() => this.actions$.pipe(
        ofType(sendSamplesConfirmAnalysisSSA),
        concatMap(() => {
            this.dialogService.openDialog(SendDialogComponent);
            return EMPTY;
        })
    ), { dispatch: false });

    // Send dialog

    sendSamplesCancelSend$ = createEffect(() => this.actions$.pipe(
        ofType(sendSamplesCancelSendSSA),
        withLatestFrom(this.store$.select(selectSampleData)),
        concatMap(([, samples]) => {
            this.openAnalysisDialog(samples);
            return EMPTY;
        })
    ), { dispatch: false });

    sendSamplesConfirmSend$ = createEffect(() => this.actions$.pipe(
        ofType(sendSamplesConfirmSendSSA),
        withLatestFrom(this.store$),
        concatMap(([action, state]) => this.sendSamplesSend(
            selectImportedFileName(state),
            {
                order: {
                    samples: selectSampleData(state),
                    meta: selectMetaData(state)
                },
                comment: this.createComment(
                    action.comment,
                    selectSendSamplesIsFileAlreadySent(state)
                ),
                receiveAs: ReceiveAs.PDF
            }
        ).pipe(
            startWith(updateIsBusySOA({ isBusy: true })),
            endWith(updateIsBusySOA({ isBusy: false }))
        ))
    ));

    // Pipes

    private sendSamples(samplesMainData: SamplesMainData): Observable<Action> {
        return this.dataService.validateSampleData(samplesMainData).pipe(
            concatMap(samples => concat(
                of(samplesUpdateSamplesSOA({ samples: samples })),
                this.sendSamplesOpenAnalysis()
            )),
            catchError((error: Error) => {
                this.logger.error('Failed to validate samples.', error.stack);
                return of(showBannerSOA({ predefined: 'validationFailure' }));
            })
        );
    }

    private sendSamplesOpenAnalysis(): Observable<Action> {
        return this.store$.pipe(
            first(),
            concatMap(state => {
                if (selectHasErrors(state)) {
                    return of(showBannerSOA({ predefined: 'validationErrors' }));
                } else if (selectHasAutoCorrections(state)) {
                    return of(showBannerSOA({ predefined: 'autocorrections' }));
                }
                const warnings: DialogWarning[] = [];
                if (selectSendSamplesIsFileAlreadySent(state)) {
                    warnings.push(this.createAlreadySentWarning(selectImportedFileName(state)));
                }
                if (selectHasWarnings(state)) {
                    warnings.push(this.createValidationWarningsWarning());
                }
                return of(sendSamplesUpdateDialogWarningsSOA({ warnings: warnings })).pipe(
                    finalize(() => {
                        this.openAnalysisDialog(selectSampleData(state));
                    })
                );
            })
        );
    }

    private sendSamplesSend(fileName: string, submission: SampleSubmission): Observable<Action> {
        return this.dataService.sendSampleSheet(submission).pipe(
            concatMap(() => of(
                sendSamplesAddSentFileSOA({ sentFile: fileName }),
                showBannerSOA({ predefined: 'sendSuccess' })
            )),
            catchError((error: Error) => {
                this.logger.error('Failed to send samples from store', error.stack);
                if (error instanceof InvalidInputError) {
                    this.logger.warn('Send samples returned with validation errors.');
                    return of(
                        samplesUpdateSamplesSOA({ samples: error.samples }),
                        showBannerSOA({ predefined: 'validationErrors' })
                    );
                } else if (error instanceof InputChangedError) {
                    this.logger.warn('Send samples returned with auto corrections');
                    return of(
                        samplesUpdateSamplesSOA({ samples: error.samples }),
                        showBannerSOA({ predefined: 'autocorrections' })
                    );
                } else if (error instanceof AuthorizationError) {
                    return of(
                        userForceLogoutMSA(),
                        // bug => this banner is not shown due to page navigation during logout
                        showBannerSOA({ predefined: 'noAuthorizationOrActivation' })
                    );
                }
                return of(showBannerSOA({ predefined: 'sendFailure' }));
            })
        );
    }

    // Utility

    private createAlreadySentWarning(fileName: string): DialogWarning {
        const strings = sendSamplesDialogWarningsStrings;
        return [
            { text: strings.alreadySentPre },
            { text: fileName },
            { text: strings.alreadySentPost }
        ];
    }

    private createValidationWarningsWarning(): DialogWarning {
        const strings = sendSamplesDialogWarningsStrings;
        return [
            { text: strings.validationWarningsPre },
            { text: strings.validationWarningsEmphasized, emphasized: true },
            { text: strings.validationWarningsPost }
        ];
    }

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

    private createComment(comment: string, alreadySent: boolean): string {
        if (alreadySent) {
            const strings = sendSamplesCommentWarningsStrings;
            return strings.preamble + ' ' + strings.alreadySent + ' ' + comment;
        }
        return comment;
    }
}
