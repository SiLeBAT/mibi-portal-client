import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import 'moment/locale/de';
import * as samplesActions from './samples.actions';
import * as coreActions from '../../core/state/core.actions';
import { map, concatMap, catchError, exhaustMap, withLatestFrom, switchMap, mergeMap, tap } from 'rxjs/operators';
import { IAnnotatedSampleData, IExcelFileBlob, IExcelData } from '../model/sample-management.model';
import { ExcelConverterService } from '../services/excel-converter.service';
import { from, of } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromSamples from '../state/samples.reducer';
import * as fromUser from '../../user/state/user.reducer';
import { Router } from '@angular/router';
import { ExcelToJsonService } from '../services/excel-to-json.service';
import { SendSampleService } from '../services/send-sample.service';
import { DataService } from '../../core/services/data.service';
import { IValidationRequest } from '../../core/model/request.model';
import { LogService } from '../../core/services/log.service';
import { ClientError } from '../../core/model/client-error';
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
            const validationRequest: IValidationRequest = this.createValidationRequestFromStore(actionStoreCombine[1]);
            return this.dataService.validateSampleData(validationRequest).pipe(
                map((annotatedSamples: IAnnotatedSampleData[]) => {
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
                map((excelData: IExcelData) => {
                    return (new samplesActions.ImportExcelFileSuccess(excelData));
                }),
                catchError((error) => {
                    this.logger.error('Failed to import Excel File', error);
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
                map((excelFileBlob: IExcelFileBlob) => {
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
            return from(this.sendSampleService.sendData(actionStoreCombine[1].samples, filenameAddon, actionStoreCombine[0].payload)).pipe(
                map(() => new coreActions.DisplayBanner({ predefined: 'sendSuccess' })),
                catchError((error) => {
                    this.logger.error('Failed to send samples from store', error);
                    return of(new coreActions.DisplayBanner({ predefined: 'sendFailure' }));
                })
            );
        }
        )
    );

    @Effect()
    sendSamplesInitation$ = this.actions$.pipe(
        ofType(samplesActions.SamplesActionTypes.SendSamplesInitiate),
        withLatestFrom(this.store),
        switchMap((actionStoreCombine: [samplesActions.SendSamplesInitiate, fromSamples.State & fromUser.IState]) => {
            const validationRequest: IValidationRequest = this.createValidationRequestFromStore(actionStoreCombine[1]);
            return this.dataService.validateSampleData(validationRequest).pipe(
                tap((annotatedSamples: IAnnotatedSampleData[]) => {
                    this.store.dispatch(new samplesActions.ValidateSamplesSuccess(annotatedSamples));
                }),
                catchError((error) => {
                    this.logger.error('Failed to initiate sending samples', error);
                    return of(new coreActions.DisplayBanner({ predefined: 'sendFailure' }));
                })
            );
        }),
        switchMap((annotatedSamples: IAnnotatedSampleData[]) => {
            if (this.hasSampleError(annotatedSamples)) {
                return of(new coreActions.DisplayBanner({ predefined: 'validationErrors' }));
            } else if (this.hasSampleAutoCorrection(annotatedSamples)) {
                return of(new coreActions.DisplayBanner({ predefined: 'autocorrections' }));
            } else {
                return of(new samplesActions.SendSamplesConfirm({
                    message: `<p>Ihre Probendaten werden jetzt an das BfR gesendet.</p>
                        <p>Bitte vergessen Sie nicht die Exceltabelle in Ihrem Mailanhang
                        auszudrucken und Ihren Isolaten beizulegen.</p>`,
                    title: 'Senden'
                }));
            }
        }),
        catchError(() => of(new coreActions.DisplayBanner({ predefined: 'sendCancel' })))
    );

    private hasSampleError(annotatedSamples: IAnnotatedSampleData[]) {
        return this.hasSampleFault(annotatedSamples, 2);
    }
    private hasSampleAutoCorrection(annotatedSamples: IAnnotatedSampleData[]) {
        return this.hasSampleFault(annotatedSamples, 4);
    }
    private hasSampleFault(annotatedSamples: IAnnotatedSampleData[], errorLEvel: number) {
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

    private createValidationRequestFromStore(state: fromSamples.State & fromUser.IState): IValidationRequest {
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
