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
} from '../store/send-samples.actions';
import { SamplesSlice } from '../../samples.state';
import { Store } from '@ngrx/store';
import { withLatestFrom, map, concatAll, concatMap } from 'rxjs/operators';
import { SamplesMainAction } from '../../state/samples.actions';
import { fromSource } from '../../../shared/command/command.selectors';
import { DisplayBanner } from '../../../core/state/core.actions';
import { Observable, of } from 'rxjs';
import {
    ValidateSamplesActionTypes,
    ValidateSamples,
    ValidateSamplesSuccess,
    ValidateSamplesFailure
} from '../../validate-samples/store/validate-samples.actions';
import { Samples } from '../../samples.store';
import { SendSamplesStates } from '../store/send-samples.state';
import { selectSendSamplesLastSentFiles, selectSendSamplesWarnings } from '../store/send-samples.selectors';
import * as _ from 'lodash';
import { SendSamplesWarnings } from '../model/send-samples-warnings';
import {
    CommentDialogOpen,
    CommentDialogConfirm,
    CommentDialogActionTypes,
    CommentDialogCancel
} from '../../comment-dialog/store/comment-dialog.actions';
import {
    SendSamplesFromStore,
    SendSamplesFromStoreSuccess,
    SendSamplesFromStoreActionTypes,
    SendSamplesFromStoreFailure,
    SendSamplesFromStoreNoUser
} from '../../send-samples-from-store/store/send-samples-from-store.actions';
import { sendSamplesDialogStrings, sendSamplesDefaultDialogConfiguration } from '../constants/send-samples-dialog.constants';
import { CommentDialogConfiguration } from '../../comment-dialog/model/comment-dialog-config.model';
import { selectFileName } from '../../state/samples.reducer';

@Injectable()
export class SendSamplesEffects {

    constructor(
        private actions$: Actions<SendSamplesAction | SamplesMainAction>,
        private store$: Store<Samples & SamplesSlice<SendSamplesStates>>
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

    // OpenDialog

    @Effect()
    openDialog$: Observable<CommentDialogOpen> = this.actions$.pipe(
        ofType<SendSamplesOpenDialog>(SendSamplesActionTypes.SendSamplesOpenDialog),
        withLatestFrom(this.store$),
        map(([, state]) => {
            const configuration = this.createDialogConfiguration(state);
            return new CommentDialogOpen(SendSamplesActionTypes.SendSamples, { configuration });
        })
    );

    // CommentDialogOpen

    @Effect()
    commentDialogConfirm$: Observable<SendSamplesFromStore> = this.actions$.pipe(
        ofType<CommentDialogConfirm>(CommentDialogActionTypes.CommentDialogConfirm),
        fromSource<CommentDialogConfirm>(SendSamplesActionTypes.SendSamples),
        withLatestFrom(this.store$),
        map(([action, state]) => {
            let comment = action.payload.comment;
            const warnings = selectSendSamplesWarnings(state);
            if (warnings.fileAlreadySent) {
                comment = sendSamplesDialogStrings.PORTAL_ALREADY_SENT_COMMENT + '\n' + comment;
            }
            return new SendSamplesFromStore(SendSamplesActionTypes.SendSamples, { comment });
        })
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

// SendSamplesFromStore

    @Effect()
sendSamplesFromStoreSuccess$: Observable<SendSamplesSuccess | DisplayBanner> = this.actions$.pipe(
    ofType<SendSamplesFromStoreSuccess>(SendSamplesFromStoreActionTypes.SendSamplesFromStoreSuccess),
    fromSource<SendSamplesFromStoreSuccess>(SendSamplesActionTypes.SendSamples),
    withLatestFrom(this.store$),
    concatMap(([, state]) => {
        const fileInfo = selectFileName(state);
        return of(
            new DisplayBanner({ predefined: 'sendSuccess' }),
            new SendSamplesSuccess({ sentFile: fileInfo }));
    })
);

    @Effect()
sendSamplesFromStoreFailure$: Observable<SendSamplesFailure | DisplayBanner> = this.actions$.pipe(
    ofType<SendSamplesFromStoreFailure>(SendSamplesFromStoreActionTypes.SendSamplesFromStoreFailure),
    fromSource<SendSamplesFromStoreFailure>(SendSamplesActionTypes.SendSamples),
    concatMap(() => {
        return of(
            new DisplayBanner({ predefined: 'sendFailure' }),
            new SendSamplesFailure());
    })
);

    @Effect()
sendSamplesFromStoreNoUser$: Observable<SendSamplesFailure | DisplayBanner> = this.actions$.pipe(
    ofType<SendSamplesFromStoreNoUser>(SendSamplesFromStoreActionTypes.SendSamplesFromStoreNoUser),
    fromSource<SendSamplesFromStoreNoUser>(SendSamplesActionTypes.SendSamples),
    concatMap(() => {
        return of(
            new DisplayBanner({ predefined: 'loginUnauthorized' }),
            new SendSamplesFailure()
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
}
