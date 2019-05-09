import { AnnotatedSampleData } from '../../model/sample-management.model';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
    SendSamplesAction,
    SendSamples,
    SendSamplesActionTypes,
    SendSamplesFailure,
    SendSamplesOpenDialog,
    SendSamplesCancel,
    SendSamplesSuccess
} from '../state/send-samples.actions';
import { SamplesSlice } from '../../samples.state';
import { Store } from '@ngrx/store';
import { withLatestFrom, map, concatAll, concatMap, catchError, tap } from 'rxjs/operators';
import { SamplesMainAction } from '../../state/samples.actions';
import { fromSource } from '../../../shared/command/command.selectors';
import { DisplayBanner } from '../../../core/state/core.actions';
import { Observable, of, from } from 'rxjs';
import {
    ValidateSamplesActionTypes,
    ValidateSamples,
    ValidateSamplesSuccess,
    ValidateSamplesFailure
} from '../../validate-samples/state/validate-samples.actions';
import { Samples } from '../../samples.store';
import { SendSamplesStates } from '../state/send-samples.state';
import { selectSendSamplesLastSentFiles, selectSendSamplesWarnings } from '../state/send-samples.selectors';
import * as _ from 'lodash';
import { SendSamplesWarnings } from '../model/send-samples-warnings';
import {
    CommentDialogOpen,
    CommentDialogConfirm,
    CommentDialogActionTypes,
    CommentDialogCancel
} from '../../../shared/comment-dialog/state/comment-dialog.actions';
import { sendSamplesDialogStrings, sendSamplesDefaultDialogConfiguration } from '../constants/send-samples-dialog.constants';
import { CommentDialogConfiguration } from '../../../shared/comment-dialog/model/comment-dialog-config.model';
import { selectFileName, selectSamplesMainData, SamplesMainData } from '../../state/samples.reducer';
import { getCurrentUser } from '../../../user/state/user.reducer';
import { SendSamplesService } from '../services/send-samples.service';
import { LogService } from '../../../core/services/log.service';
import { TokenizedUser } from '../../../user/model/user.model';

interface SendSamplesFromStorePayload {
    currentUser: TokenizedUser;
    sampleData: SamplesMainData;
    comment: string;
}

@Injectable()
export class SendSamplesEffects {

    constructor(
        private actions$: Actions<SendSamplesAction | SamplesMainAction>,
        private store$: Store<Samples & SamplesSlice<SendSamplesStates>>,
        private sendSampleService: SendSamplesService,
        private logger: LogService
    ) { }

    // SendSamples

    @Effect()
    sendSamples$: Observable<ValidateSamples | SendSamplesFailure> = this.actions$.pipe(
        ofType<SendSamples>(SendSamplesActionTypes.SendSamples),
        map(() => {
            return new ValidateSamples(SendSamplesActionTypes.SendSamples);
        })
    );

    // ValidateSamples

    @Effect()
    validateSamplesSuccess$: Observable<SendSamplesOpenDialog | DisplayBanner | SendSamplesFailure> = this.actions$.pipe(
        ofType<ValidateSamplesSuccess>(ValidateSamplesActionTypes.ValidateSamplesSuccess),
        fromSource<ValidateSamplesSuccess>(SendSamplesActionTypes.SendSamples),
        withLatestFrom(this.store$),
        map(([action, state]) => {
            const sampleData = action.payload;
            if (this.hasSampleError(sampleData)) {
                return of(
                    new DisplayBanner({ predefined: 'validationErrors' }),
                    new SendSamplesFailure()
                );
            } else if (this.hasSampleAutoCorrection(sampleData)) {
                return of(
                    new DisplayBanner({ predefined: 'autocorrections' }),
                    new SendSamplesFailure()
                );
            } else {
                const warnings: SendSamplesWarnings = {
                    fileAlreadySent: this.isFileAlreadySent(state)
                };
                return of(new SendSamplesOpenDialog({ warnings }));
            }
        }),
        concatAll()
    );

    @Effect()
    validateSamplesFailure$: Observable<SendSamplesFailure> = this.actions$.pipe(
        ofType<ValidateSamplesFailure>(ValidateSamplesActionTypes.ValidateSamplesFailure),
        fromSource<ValidateSamplesFailure>(SendSamplesActionTypes.SendSamples),
        map(() => {
            return new SendSamplesFailure();
        })
    );

    // SendSamplesOpenDialog

    @Effect()
    sendSamplesOpenDialog$: Observable<CommentDialogOpen> = this.actions$.pipe(
        ofType<SendSamplesOpenDialog>(SendSamplesActionTypes.SendSamplesOpenDialog),
        withLatestFrom(this.store$),
        map(([, state]) => {
            const configuration = this.createDialogConfiguration(state);
            return new CommentDialogOpen(SendSamplesActionTypes.SendSamples, { configuration });
        })
    );

    // CommentDialogOpen

    @Effect()
    commentDialogConfirm$: Observable<SendSamplesSuccess | SendSamplesFailure | DisplayBanner> = this.actions$.pipe(
        ofType<CommentDialogConfirm>(CommentDialogActionTypes.CommentDialogConfirm),
        fromSource<CommentDialogConfirm>(SendSamplesActionTypes.SendSamples),
        withLatestFrom(this.store$),
        map(([action, state]) => {
            const currentUser = getCurrentUser(state);
            if (!currentUser) {
                return of(
                    new DisplayBanner({ predefined: 'loginUnauthorized' }),
                    new SendSamplesFailure()
                );
            }
            const sampleData = selectSamplesMainData(state);
            const fileName = selectFileName(state);
            let comment = action.payload.comment;
            const warnings = selectSendSamplesWarnings(state);
            if (warnings.fileAlreadySent) {
                comment = sendSamplesDialogStrings.PORTAL_ALREADY_SENT_COMMENT + '\n' + comment;
            }
            return this.sendSamplesFromStore(currentUser, sampleData, comment).pipe(
                map(() => of(
                    new DisplayBanner({ predefined: 'sendSuccess' }),
                    new SendSamplesSuccess({ sentFile: fileName })
                )),
                concatAll(),
                catchError((error) => {
                    this.logger.error('Failed to send samples from store', error);
                    return of(
                        new DisplayBanner({ predefined: 'sendFailure' }),
                        new SendSamplesFailure()
                    );
                })
            );
        }),
        concatAll()
    );

    @Effect()
    commentDialogCancel$: Observable<SendSamplesCancel | DisplayBanner> = this.actions$.pipe(
        ofType<CommentDialogCancel>(CommentDialogActionTypes.CommentDialogCancel),
        fromSource<CommentDialogCancel>(SendSamplesActionTypes.SendSamples),
        concatMap(() => {
            return of(
                new DisplayBanner({ predefined: 'sendCancel' }),
                new SendSamplesCancel()
            );
        })
    );

    // Helpers

    private createDialogConfiguration(state: Samples & SamplesSlice<SendSamplesStates>): CommentDialogConfiguration {
        const warnings = selectSendSamplesWarnings(state);
        const fileName = selectFileName(state);
        const configuration = _.cloneDeep(sendSamplesDefaultDialogConfiguration);
        if (warnings.fileAlreadySent) {
            configuration.warnings.push(
                sendSamplesDialogStrings.ALREADY_SENT_WARNING_PRE
                + fileName
                + sendSamplesDialogStrings.ALREADY_SENT_WARNING_POST
            );
        }
        if (configuration.warnings.length !== 0) {
            configuration.confirmButtonConfig.label = sendSamplesDialogStrings.REGARDLESS_BUTTON_LABEL;
        }
        return configuration;
    }

    private isFileAlreadySent(state: Samples & SamplesSlice<SendSamplesStates>): boolean {
        const fileName = selectFileName(state);
        const lastSentFiles = selectSendSamplesLastSentFiles(state);
        return lastSentFiles.includes(fileName);
    }

    private hasSampleError(annotatedSamples: AnnotatedSampleData[]) {
        return this.hasSampleFault(annotatedSamples, 2);
    }
    private hasSampleAutoCorrection(annotatedSamples: AnnotatedSampleData[]) {
        return this.hasSampleFault(annotatedSamples, 4);
    }
    private hasSampleFault(annotatedSamples: AnnotatedSampleData[], errorLEvel: number) {
        return annotatedSamples.reduce(
            (acc, entry) => {
                let count = 0;
                for (const err of Object.keys(entry.errors)) {
                    count += entry.errors[err].filter(
                        e => e.level === errorLEvel
                    ).length;
                }
                return acc += count;
            },
            0
        );
    }

    private sendSamplesFromStore(currentUser: TokenizedUser, sampleData: SamplesMainData, comment: string): Observable<Object> {
        const filenameAddon = '_validated';
        return from(this.sendSampleService.sendData(
            {
                formData: sampleData.formData,
                fileDetails: sampleData.fileDetails
            },
            filenameAddon,
            currentUser,
            comment,
            sampleData.nrl
        ));
    }
}
