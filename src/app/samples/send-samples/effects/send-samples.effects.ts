import { SampleSet } from '../../model/sample-management.model';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
    SendSamplesAction,
    SendSamplesActionTypes,
    SendSamplesCancel,
    StoreSampleWarnings,
    SendSamples,
    SendSamplesSuccess
} from '../state/send-samples.actions';
import { SamplesSlice } from '../../samples.state';
import { Store } from '@ngrx/store';
import { withLatestFrom, map, concatAll, concatMap, catchError } from 'rxjs/operators';
import { SamplesMainAction } from '../../state/samples.actions';
import { fromSource } from '../../../shared/command/command.selectors';
import { DisplayBanner } from '../../../core/state/core.actions';
import { Observable, of, from } from 'rxjs';
import {
    ValidateSamplesSuccess
} from '../../validate-samples/state/validate-samples.actions';
import { Samples } from '../../samples.store';
import { SendSamplesStates } from '../state/send-samples.state';
import { selectSendSamplesLastSentFiles, selectSendSamplesWarnings } from '../state/send-samples.selectors';
import * as _ from 'lodash';
import {
    CommentDialogOpen,
    CommentDialogConfirm,
    CommentDialogActionTypes,
    CommentDialogCancel
} from '../../../shared/comment-dialog/state/comment-dialog.actions';
import { sendSamplesDialogStrings, sendSamplesDefaultDialogConfiguration } from '../constants/send-samples-dialog.constants';
import { CommentDialogConfiguration } from '../../../shared/comment-dialog/model/comment-dialog-config.model';
import {
    selectImportedFileName,
    selectFormData,
    selectMetaData
} from '../../state/samples.reducer';
import { LogService } from '../../../core/services/log.service';
import { DataService } from '../../../core/services/data.service';
import { InvalidInputError, InputChangedError, AuthorizationError } from '../../../core/model/client-error';
import { LogoutUser } from '../../../user/state/user.actions';

@Injectable()
export class SendSamplesEffects {

    constructor(
        private actions$: Actions<SendSamplesAction | SamplesMainAction>,
        private store$: Store<Samples & SamplesSlice<SendSamplesStates>>,
        private dataService: DataService,
        private logger: LogService
    ) { }

    // SendSamplesOpenDialog

    @Effect()
    sendSamples$: Observable<CommentDialogOpen> = this.actions$.pipe(
        ofType<SendSamples>(SendSamplesActionTypes.SendSamples),
        withLatestFrom(this.store$),
        map(([, state]) => {
            let warnings: string[] = [];
            if (this.isFileAlreadySent(state)) {
                this.store$.dispatch(new StoreSampleWarnings({
                    warnings: {
                        fileAlreadySent: true
                    }
                }));
                const fileName = selectImportedFileName(state);
                warnings = [
                    sendSamplesDialogStrings.ALREADY_SENT_WARNING_PRE
                    + fileName
                    + sendSamplesDialogStrings.ALREADY_SENT_WARNING_POST
                ];
            }
            const configuration = this.createDialogConfiguration(
                warnings
            );
            return new CommentDialogOpen(SendSamplesActionTypes.SendSamples, { configuration });
        })
    );

    // CommentDialogOpen

    @Effect()
    commentDialogConfirm$: Observable<DisplayBanner | ValidateSamplesSuccess | SendSamplesSuccess | LogoutUser> = this.actions$.pipe(
        ofType<CommentDialogConfirm>(CommentDialogActionTypes.CommentDialogConfirm),
        fromSource<CommentDialogConfirm>(SendSamplesActionTypes.SendSamples),
        withLatestFrom(this.store$),
        map(([action, state]) => {
            const fileName = selectImportedFileName(state);
            let comment = action.payload.comment;
            const warnings = selectSendSamplesWarnings(state);
            if (warnings.fileAlreadySent) {
                comment = sendSamplesDialogStrings.PORTAL_ALREADY_SENT_COMMENT + '\n' + comment;
            }
            const annotatedSampleSet: SampleSet = {
                samples: selectFormData(state),
                meta: selectMetaData(state)
            };
            return from(this.dataService.sendSampleSheet({
                order: annotatedSampleSet,
                comment: comment
            })).pipe(
                map(() => of(
                    new DisplayBanner({ predefined: 'sendSuccess' }),
                    new SendSamplesSuccess({ sentFile: fileName })
                )),
                concatAll(),
                catchError((error) => {
                    this.logger.error('Failed to send samples from store', error);
                    if (error instanceof InvalidInputError) {
                        return of(
                            new DisplayBanner({ predefined: 'validationErrors' }),
                            new ValidateSamplesSuccess(error.data)
                        );
                    } else if (error instanceof InputChangedError) {
                        return of(
                            new DisplayBanner({ predefined: 'autocorrections' }),
                            new ValidateSamplesSuccess(error.data)
                        );
                    } else if (error instanceof AuthorizationError) {
                        return of(
                            new LogoutUser(),
                            new DisplayBanner({ predefined: 'noAuthorizationOrActivation' })
                        );
                    }
                    return of(new DisplayBanner({ predefined: 'sendFailure' }));
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

    private createDialogConfiguration(additionalWarnings: string[] = []): CommentDialogConfiguration {
        const configuration = _.cloneDeep(sendSamplesDefaultDialogConfiguration);
        configuration.warnings = configuration.warnings.concat(additionalWarnings);
        if (configuration.warnings.length !== 0) {
            configuration.confirmButtonConfig.label = sendSamplesDialogStrings.REGARDLESS_BUTTON_LABEL;
        }
        return configuration;
    }

    private isFileAlreadySent(state: Samples & SamplesSlice<SendSamplesStates>): boolean {
        const fileName = selectImportedFileName(state);
        const lastSentFiles = selectSendSamplesLastSentFiles(state);
        return lastSentFiles.includes(fileName);
    }

}
