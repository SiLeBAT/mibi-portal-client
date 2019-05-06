import { AnnotatedSampleData } from '../../model/sample-management.model';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
    SendSamplesAction,
    SendSamples,
    SendSamplesActionTypes,
    SendSamplesFailure,
    SendSamplesCancel,
    SendSamplesSuccess
} from './send-samples.actions';
import { SamplesSlice } from '../../samples.state';
import { Store } from '@ngrx/store';
import { withLatestFrom, map, concatAll, concatMap } from 'rxjs/operators';
import { SamplesMainAction } from '../../state/samples.actions';
import { fromSource } from '../../../shared/command/command.selectors';
import { DisplayBanner } from '../../../core/state/core.actions';
import {
    sendSamplesDefaultDialogConfiguration,
    SEND_SAMPLES_ALREADY_SENT_WARNING,
    SEND_SAMPLES_REGARDLESS_BUTTON_LABEL,
    SEND_SAMPLES_ALREADY_SENT_COMMENT
} from '../constants/send-samples-dialog.constants';
import {
    CommentDialogOpen,
    CommentDialogConfirm,
    CommentDialogActionTypes,
    CommentDialogCancel
} from '../../comment-dialog/store/comment-dialog.actions';
import { Observable, of, config } from 'rxjs';
import {
    ValidateSamplesActionTypes,
    ValidateSamples,
    ValidateSamplesSuccess,
    ValidateSamplesFailure
} from '../../validate-samples/store/validate-samples.actions';
import {
    SendSamplesFromStore,
    SendSamplesFromStoreSuccess,
    SendSamplesFromStoreActionTypes,
    SendSamplesFromStoreFailure,
    SendSamplesFromStoreNoUser
} from '../../send-samples-from-store/store/send-samples-from-store.actions';
import { selectFileInfo, SamplesMainStates } from '../../state/samples.reducer';
import { Samples } from '../../samples.store';
import { SendSamplesStates } from './send-samples.state';
import { selectSendSamplesLastSentFile } from './send-samples.selectors';
import * as _ from 'lodash';
import { CommentDialogConfiguration } from '../../comment-dialog/model/comment-dialog-config.model';

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
    validateSamplesSuccess$: Observable<CommentDialogOpen | DisplayBanner | SendSamplesFailure> = this.actions$.pipe(
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
                const configuration = _.cloneDeep(sendSamplesDefaultDialogConfiguration);
                this.addWarnings(state, configuration);
                return of(new CommentDialogOpen(SendSamplesActionTypes.SendSamples, { configuration: configuration }));
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

    // CommentDialog

    @Effect()
    commentDialogConfirm$: Observable<SendSamplesFromStore> = this.actions$.pipe(
        ofType<CommentDialogConfirm>(CommentDialogActionTypes.CommentDialogConfirm),
        fromSource<CommentDialogConfirm>(SendSamplesActionTypes.SendSamples),
        map((action) => new SendSamplesFromStore(SendSamplesActionTypes.SendSamples, { comment: action.payload.comment }))
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
            const fileInfo = selectFileInfo(state);
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

    private addWarnings(state: Samples & SamplesSlice<SendSamplesStates>, configuration: CommentDialogConfiguration) {
        if (this.isFileAlreadySent(state)) {
            configuration.warnings.push(SEND_SAMPLES_ALREADY_SENT_WARNING);
            configuration.initialComment = SEND_SAMPLES_ALREADY_SENT_COMMENT;
        }
        if (configuration.warnings.length !== 0) {
            configuration.confirmButtonConfig.label = SEND_SAMPLES_REGARDLESS_BUTTON_LABEL;
        }
    }

    private isFileAlreadySent(state: Samples & SamplesSlice<SendSamplesStates>): boolean {
        const fileInfo = selectFileInfo(state);
        const lastSentFile = selectSendSamplesLastSentFile(state);
        return fileInfo.fileName === lastSentFile.fileName;
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
