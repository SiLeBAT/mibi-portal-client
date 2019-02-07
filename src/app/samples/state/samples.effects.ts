import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import 'moment/locale/de';
import * as samplesActions from './samples.actions';
import * as coreActions from '../../core/state/core.actions';
import { map, concatMap, catchError, exhaustMap, withLatestFrom, switchMap, mergeMap, tap } from 'rxjs/operators';
import { AnnotatedSampleData, ExcelFileBlob, ExcelData } from '../model/sample-management.model';
import { ExcelConverterService } from '../services/excel-converter.service';
import { from, of } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromSamples from '../state/samples.reducer';
import * as fromUser from '../../user/state/user.reducer';
import { Router } from '@angular/router';
import { ExcelToJsonService } from '../services/excel-to-json.service';
import { SendSampleService } from '../services/send-sample.service';
import { DataService } from '../../core/services/data.service';
import { ValidationRequest } from '../../core/model/request.model';
import { LogService } from '../../core/services/log.service';
import { ClientError } from '../../core/model/client-error';
import { UserActionType, ColorType } from '../../shared/model/user-action.model';
import { GenericActionItemComponent } from '../../core/presentation/generic-action-item/generic-action-item.component';
@Injectable()
export class SamplesEffects {

    constructor(private actions$: Actions,
        private excelConverterService: ExcelConverterService,
        private sendSampleService: SendSampleService,
        private excelToJsonService: ExcelToJsonService,
        private dataService: DataService,
        private router: Router,
        private logger: LogService,
        private store: Store<fromSamples.State>) {
    }

    @Effect()
    validateSamples$ = this.actions$.pipe(
        ofType(samplesActions.SamplesActionTypes.ValidateSamples),
        withLatestFrom(this.store),
        concatMap((actionStoreCombine: [samplesActions.ValidateSamples, fromSamples.State & fromUser.IState]) => {
            const validationRequest: ValidationRequest = this.createValidationRequestFromStore(actionStoreCombine[1]);
            return this.dataService.validateSampleData(validationRequest).pipe(
                map((annotatedSamples: AnnotatedSampleData[]) => {
                    return (new samplesActions.ValidateSamplesSuccess(annotatedSamples));
                }),
                catchError((error) => {
                    this.logger.error('Failed to validate samples', error);
                    return of(new coreActions.DisplayBanner({ predefined: 'validationFailure' }));
                })
            );
        })
    );

    @Effect()
    importExcel$ = this.actions$.pipe(
        ofType(samplesActions.SamplesActionTypes.ImportExcelFile),
        exhaustMap((action: samplesActions.ImportExcelFile) => {
            return from(this.excelToJsonService.convertExcelToJSJson(action.payload)).pipe(
                map((excelData: ExcelData) => {
                    if (excelData.meta.nrl === '') {
                        return (new coreActions.DisplayDialog({
                            // tslint:disable-next-line:max-line-length
                            message: `Das ausgewählte Labor im Kopf Ihres Probeneinsendebogens entspricht keiner der möglichen Vorauswahlen. Bitte wählen Sie ein Labor aus der vorhandenen Liste.`,
                            title: 'Unbekanntes NRL',
                            mainAction: {
                                type: UserActionType.CUSTOM,
                                label: 'Ok',
                                onExecute: () => {
                                    this.store.dispatch(new samplesActions.ImportExcelFileSuccess(excelData));
                                },
                                component: GenericActionItemComponent,
                                icon: '',
                                color: ColorType.PRIMARY,
                                focused: true
                            }
                        }));
                    }
                    return (new samplesActions.ImportExcelFileSuccess(excelData));
                }),
                catchError((error) => {
                    this.logger.error(`Failed to import Excel File. error=${error}`);
                    return of(new coreActions.DisplayBanner({ predefined: 'uploadFailure' }));
                })
            );
        })
    );

    @Effect()
    importExcelSuccess$ = this.actions$.pipe(
        ofType(samplesActions.SamplesActionTypes.ImportExcelFileSuccess),
        map(() => {
            this.router.navigate(['/samples']).catch(() => {
                throw new ClientError('Unable to navigate.');
            });
            return new samplesActions.ValidateSamples();
        })
    );

    @Effect()
    exportExcel$ = this.actions$.pipe(
        ofType(samplesActions.SamplesActionTypes.ExportExcelFile),
        withLatestFrom(this.store),
        mergeMap((actionStoreCombine: [samplesActions.ExportExcelFile, fromSamples.State & fromUser.IState]) => {
            const filenameAddon = '.MP_' + moment().unix();
            const sampleSheet = fromSamples.getSamplesFeatureState(actionStoreCombine[1]);
            return from(this.excelConverterService.convertToExcel(sampleSheet, filenameAddon)).pipe(
                map((excelFileBlob: ExcelFileBlob) => {
                    saveAs(excelFileBlob.blob, excelFileBlob.fileName);
                    return new samplesActions.ExportExcelFileSuccess();
                }),
                catchError((error) => {
                    this.logger.error('Failed to export Excel File', error);
                    return of(new coreActions.DisplayBanner({ predefined: 'exportFailure' }));
                })
            );
        })
    );

    @Effect()
    sendSamplesFromStore$ = this.actions$.pipe(
        ofType(samplesActions.SamplesActionTypes.SendSamplesFromStore),
        withLatestFrom(this.store),
        mergeMap((actionStoreCombine: [samplesActions.SendSamplesFromStore, fromSamples.State]) => {
            const filenameAddon = '_validated';
            return from(this.sendSampleService.sendData(
                {
                    formData: actionStoreCombine[1].samples.formData,
                    workSheet: actionStoreCombine[1].samples.workSheet
                },
                filenameAddon,
                actionStoreCombine[0].payload,
                actionStoreCombine[1].samples.nrl)).pipe(
                    map(() => new coreActions.DisplayBanner({ predefined: 'sendSuccess' })),
                    catchError((error) => {
                        this.logger.error('Failed to send samples from store', error);
                        return of(new coreActions.DisplayBanner({ predefined: 'sendFailure' }));
                    })
                );
        }
        )
    );

    @Effect({ dispatch: false })
    sendSamplesInitation$ = this.actions$.pipe(
        ofType(samplesActions.SamplesActionTypes.SendSamplesInitiate),
        withLatestFrom(this.store),
        switchMap((actionStoreCombine: [samplesActions.SendSamplesInitiate, fromSamples.State & fromUser.IState]) => {
            const validationRequest: ValidationRequest = this.createValidationRequestFromStore(actionStoreCombine[1]);
            return this.dataService.validateSampleData(validationRequest).pipe(
                tap((annotatedSamples: AnnotatedSampleData[]) => {
                    this.store.dispatch(new samplesActions.ValidateSamplesSuccess(annotatedSamples));
                }),
                catchError((error) => {
                    this.logger.error('Failed to initiate sending samples', error);
                    return of(new coreActions.DisplayBanner({ predefined: 'sendFailure' }));
                })
            );
        }),
        withLatestFrom(this.store),
        tap((combine: [AnnotatedSampleData[], fromSamples.State & fromUser.IState]) => {
            if (this.hasSampleError(combine[0])) {
                this.store.dispatch(new coreActions.DisplayBanner({ predefined: 'validationErrors' }));
            } else if (this.hasSampleAutoCorrection(combine[0])) {
                this.store.dispatch(new coreActions.DisplayBanner({ predefined: 'autocorrections' }));
            } else {
                this.store.dispatch(new coreActions.DisplayDialog({
                    message: `Ihre Probendaten werden jetzt an das BfR gesendet.
                        Bitte vergessen Sie nicht die Exceltabelle in Ihrem Mailanhang
                        auszudrucken und Ihren Isolaten beizulegen.`,
                    title: 'Senden',
                    mainAction: {
                        type: UserActionType.CUSTOM,
                        label: 'Senden',
                        onExecute: () => {
                            const currentUser = fromUser.getCurrentUser(combine[1]);
                            if (currentUser) {
                                this.store.dispatch(new samplesActions.SendSamplesFromStore(currentUser));
                            } else {
                                this.store.dispatch(new coreActions.DisplayBanner({ predefined: 'loginUnauthorized' }));
                            }
                        },
                        component: GenericActionItemComponent,
                        icon: '',
                        color: ColorType.PRIMARY,
                        focused: true
                    },
                    auxilliaryAction: {
                        type: UserActionType.CUSTOM,
                        label: 'Abbrechen',
                        onExecute: () => {
                            this.store.dispatch(new coreActions.DisplayBanner({ predefined: 'sendCancel' }));
                        },
                        component: GenericActionItemComponent,
                        icon: '',
                        color: ColorType.PRIMARY
                    }
                }));
            }
        }),
        catchError((error) => {
            this.logger.error('Failed to initiate sending samples', error);
            return of(new coreActions.DisplayBanner({ predefined: 'sendCancel' }));
        })
    );

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

    private createValidationRequestFromStore(state: fromSamples.State & fromUser.IState): ValidationRequest {
        const cu = fromUser.getCurrentUser(state) || null;
        return {
            data: fromSamples.getDataValues(state),
            meta: {
                state: cu ? cu.institution.stateShort : '',
                nrl: fromSamples.getNRL(state)
            }
        };
    }
}
