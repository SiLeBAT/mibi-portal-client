import { SampleSet } from '../model/sample-management.model';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
    SendSamplesAction,
    SendSamplesActionTypes,
    SendSamplesCancel,
    StoreSampleWarnings,
    SendSamples,
    SendSamplesSuccess
} from './state/send-samples.actions';
import { SamplesSlice, SamplesMainSlice } from '../samples.state';
import { Store } from '@ngrx/store';
import { withLatestFrom, map, concatAll, concatMap, catchError } from 'rxjs/operators';
import { SamplesMainAction } from '../state/samples.actions';
import { fromSource } from '../../shared/command/command.selectors';
import { DisplayBanner } from '../../core/state/core.actions';
import { Observable, of, from } from 'rxjs';
import {
    ValidateSamplesSuccess
} from '../validate-samples/validate-samples.actions';
import { SendSamplesState } from './state/send-samples.reducer';
import { selectSendSamplesLastSentFiles, selectSendSamplesWarnings } from './state/send-samples.selectors';
import * as _ from 'lodash';
import {
    CommentDialogOpen,
    CommentDialogConfirm,
    CommentDialogActionTypes,
    CommentDialogCancel
} from '../../shared/comment-dialog/state/comment-dialog.actions';
import { sendSamplesDialogStrings, sendSamplesDefaultDialogConfiguration } from './send-samples.constants';
import { CommentDialogConfiguration } from '../../shared/comment-dialog/comment-dialog.model';
import { selectImportedFileName, selectFormData, selectMetaData } from '../state/samples.selectors';
import { LogService } from '../../core/services/log.service';
import { DataService } from '../../core/services/data.service';
import { AuthorizationError } from '../../core/model/client-error';
import { LogoutUser } from '../../user/state/user.actions';
import { InvalidInputError, InputChangedError } from '../../core/model/data-service-error';

@Injectable()
export class SendSamplesEffects {

    constructor(
        private actions$: Actions<SendSamplesAction | SamplesMainAction>,
        private store$: Store<SamplesMainSlice & SamplesSlice<SendSamplesState>>,
        private dataService: DataService,
        private logger: LogService
    ) { }

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
                    new SendSamplesSuccess({ sentFile: fileName }),
                    new DisplayBanner({ predefined: 'sendSuccess' })
                )),
                concatAll(),
                catchError((error) => {
                    this.logger.error('Failed to send samples from store', error);
                    if (error instanceof InvalidInputError) {
                        return of(
                            new ValidateSamplesSuccess(error.sampleData),
                            new DisplayBanner({ predefined: 'validationErrors' })
                        );
                    } else if (error instanceof InputChangedError) {
                        return of(
                            new ValidateSamplesSuccess(error.sampleData),
                            new DisplayBanner({ predefined: 'autocorrections' })
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
                new SendSamplesCancel(),
                new DisplayBanner({ predefined: 'sendCancel' })
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

    private isFileAlreadySent(state: SamplesMainSlice & SamplesSlice<SendSamplesState>): boolean {
        const fileName = selectImportedFileName(state);
        const lastSentFiles = selectSendSamplesLastSentFiles(state);
        return lastSentFiles.includes(fileName);
    }

}
