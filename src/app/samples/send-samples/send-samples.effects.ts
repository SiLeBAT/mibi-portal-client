import { Inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import _ from 'lodash';
import { EMPTY, Observable, concat, of } from 'rxjs';
import { catchError, concatMap, endWith, finalize, first, map, startWith, withLatestFrom } from 'rxjs/operators';
import { AuthorizationError, EndpointError } from '../../core/model/client-error';
import { InputChangedError, InvalidInputError } from '../../core/model/data-service-error';
import { AlertType } from '../../core/model/alert.model';
import { MAIL_DELIVERY_FAILED_CODE, sendOutcomeStrings } from '../../core/constants/send-outcome.constants';
import { DataService } from '../../core/services/data.service';
import { LogService } from '../../core/services/log.service';
import { UserActionService } from '../../core/services/user-action.service';
import { UserActionType } from '../../shared/model/user-action.model';
import { hideBannerSOA, showBannerSOA, showCustomBannerSOA, updateIsBusySOA } from '../../core/state/core.actions';
import { DialogWarning } from '../../shared/dialog/dialog.model';
import { DialogService } from '../../shared/dialog/dialog.service';
import { navigateMSA } from '../../shared/navigate/navigate.actions';
import { KEYCLOAK_ENABLED } from '../../user/services/auth.tokens';
import { KeycloakAuthService } from '../../user/services/keycloak-auth.service';
import { userForceLogoutMSA } from '../../user/state/user.actions';
import { SamplesLinkProviderService } from '../link-provider.service';
import { ReceiveAs, Sample, SampleSubmission } from '../model/sample-management.model';
import { SamplesMainSlice, SamplesSlice } from '../samples.state';
import { samplesDestroyMainDataSOA, samplesUpdateSamplesSOA } from '../state/samples.actions';
import { SamplesMainData } from '../state/samples.reducer';
import {
    selectHasAutoCorrections,
    selectHasErrors,
    selectHasWarnings,
    selectImportedFileName,
    selectMetaData,
    selectSampleData,
    selectSamplesMainData
} from '../state/samples.selectors';
import { AnalysisStepperComponent } from './components/analysis-stepper.component';
import { SendDialogComponent } from './components/send-dialog.component';
import { sendSamplesCommentWarningsStrings, sendSamplesDialogWarningsStrings } from './send-samples.constants';
import {
    sendSamplesAddSentFileSOA,
    sendSamplesCancelAnalysisSSA,
    sendSamplesCancelSendSSA,
    sendSamplesConfirmAnalysisSSA,
    sendSamplesConfirmSendSSA,
    sendSamplesSSA,
    sendSamplesUpdateDialogWarningsSOA
} from './state/send-samples.actions';
import { SendSamplesState } from './state/send-samples.reducer';
import { selectSendSamplesIsFileAlreadySent } from './state/send-samples.selectors';

@Injectable()
export class SendSamplesEffects {

    constructor(
        private actions$: Actions,
        private store$: Store<SamplesMainSlice & SamplesSlice<SendSamplesState>>,
        private dataService: DataService,
        private logger: LogService,
        private dialogService: DialogService,
        private samplesLinks: SamplesLinkProviderService,
        private authService: KeycloakAuthService,
        private userActionService: UserActionService,
        @Inject(KEYCLOAK_ENABLED) private keycloakEnabled: boolean
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
            catchError((error) => {
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
            concatMap(result => of(
                sendSamplesAddSentFileSOA({ sentFile: fileName }),
                navigateMSA({ path: this.samplesLinks.upload }),
                // Clear the sent samples from memory (as if "Schließen" had been clicked),
                // so the "Probendaten" tab points back to upload and clicking it does nothing.
                // Sent samples are viewed via the order list, not by leaving them in the editor.
                samplesDestroyMainDataSOA(),
                // The order reached the BfR either way. When the sender's own
                // copy was lost they still need a Probenbegleitschein, so they
                // are told to print the file they uploaded instead of being
                // pointed at a mail attachment that never arrived.
                result.customerCopySent
                    ? showBannerSOA({ predefined: 'sendSuccess' })
                    : showBannerSOA({ predefined: 'sendSuccessNoCustomerCopy' })
            )),
            catchError((error) => {
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
                    if (this.keycloakEnabled) {
                        this.authService.login();
                        return EMPTY;
                    }
                    return of(
                        userForceLogoutMSA(),
                        // bug => this banner is not shown due to page navigation during logout
                        showBannerSOA({ predefined: 'noAuthorizationOrActivation' })
                    );
                }
                return of(this.createSendFailureBanner(error));
            })
        );
    }

    // Nothing reached the BfR. When the mail system is what failed and a phone
    // number is configured, the sender is told to ring the responsible person -
    // writing to us is pointless while mail is down. Any other failure, or a
    // missing number, falls back to the plain "please try again later" banner
    // rather than blaming mail for a problem that was not mail's.
    //
    // The number arrives on the error DTO rather than from the system-info
    // endpoint: that endpoint is answered by the legacy server from its own
    // configuration and knows nothing about this value.
    private createSendFailureBanner(error: unknown): Action {
        const errorDTO: { code?: unknown; supportPhone?: unknown } | undefined =
            error instanceof EndpointError ? error.errorDTO : undefined;
        const supportPhone = typeof errorDTO?.supportPhone === 'string'
            ? errorDTO.supportPhone
            : '';
        const mailDeliveryFailed = errorDTO?.code === MAIL_DELIVERY_FAILED_CODE;

        if (!mailDeliveryFailed || !supportPhone) {
            return showBannerSOA({ predefined: 'sendFailure' });
        }

        return showCustomBannerSOA({
            banner: {
                message: sendOutcomeStrings.mailSystemDown(supportPhone),
                type: AlertType.ERROR,
                icon: 'error',
                mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
            }
        });
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
            const warning = strings.preamble + ' ' + strings.alreadySent;
            return comment === '' ? warning : warning + '\n\n' + comment;
        }
        return comment;
    }
}
