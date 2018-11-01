import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import 'moment/locale/de';
import * as samplesActions from './samples.actions';
import * as coreActions from '../../core/state/core.actions';
import { map, concatMap, catchError, exhaustMap, withLatestFrom, switchMap, mergeMap, pluck, tap } from 'rxjs/operators';
import { IAnnotatedSampleData, IExcelFileBlob, IExcelData } from '../model/sample-management.model';
import { ExcelConverterService } from '../services/excel-converter.service';
import { from, of } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromSamples from '../state/samples.reducer';
import * as fromUser from '../../user/state/user.reducer';
import { AlertType } from '../../core/model/alert.model';
import { Router } from '@angular/router';
import { ExcelToJsonService } from '../services/excel-to-json.service';
import { SendSampleService } from '../services/send-sample.service';
import { DataService } from '../../core/services/data.service';
import { IUser } from '../../user/model/user.model';
import { IValidationRequest } from '../../core/model/request.model';
@Injectable()
export class SamplesEffects {

    constructor(private actions$: Actions,
        private excelConverterService: ExcelConverterService,
        private sendSampleService: SendSampleService,
        private excelToJsonService: ExcelToJsonService,
        private dataService: DataService,
        private router: Router,
        private store: Store<fromSamples.State>) {
    }

    @Effect()
    validateSamples$ = this.actions$.pipe(
        ofType(samplesActions.SamplesActionTypes.ValidateSamples),
        concatMap((action: samplesActions.ValidateSamples) => this.dataService.validateSampleData(action.payload).pipe(
            map((annotatedSamples: IAnnotatedSampleData[]) => {
                return (new samplesActions.ValidateSamplesSuccess(annotatedSamples));
            }),
            catchError(() => of(new coreActions.DisplayBanner({ predefined: 'validationFailure' })))
        ))
    );

    @Effect()
    importExcel$ = this.actions$.pipe(
        ofType(samplesActions.SamplesActionTypes.ImportExcelFile),
        exhaustMap((action: samplesActions.ImportExcelFile) => {
            return from(this.excelToJsonService.convertExcelToJSJson(action.payload)).pipe(
                map((excelData: IExcelData) => {
                    return (new samplesActions.ImportExcelFileSuccess(excelData));
                }),
                catchError(() => {
                    return of(new coreActions.DisplayBanner({ predefined: 'uploadFailure' }));
                })
            );
        })
    );

    @Effect()
    importExcelSuccess$ = this.actions$.pipe(
        ofType(samplesActions.SamplesActionTypes.ImportExcelFileSuccess),
        withLatestFrom(this.store),
        map((actionStoreCombine: [samplesActions.ExportExcelFileSuccess, fromSamples.State & fromUser.IState]) => {
            this.router.navigate(['/samples']).catch(() => {
                throw new Error('Unable to navigate.');
            });
            return new samplesActions.ValidateSamples({
                data: actionStoreCombine[1].samples.formData.map(e => e.data),
                meta: {
                    state: actionStoreCombine[1].user.currentUser ?
                        (actionStoreCombine[1].user.currentUser as IUser).institution.stateShort : '',
                    nrl: actionStoreCombine[1].samples.nrl ?
                        actionStoreCombine[1].samples.nrl : ''
                }
            });
        })
    );

    @Effect()
    exportExcel$ = this.actions$.pipe(
        ofType(samplesActions.SamplesActionTypes.ExportExcelFile),
        mergeMap((action: samplesActions.ExportExcelFile) => {
            const filenameAddon = '.MP_' + moment().unix();
            return from(this.excelConverterService.convertToExcel(action.payload, filenameAddon)).pipe(
                map((excelFileBlob: IExcelFileBlob) => {
                    saveAs(excelFileBlob.blob, excelFileBlob.fileName);
                    return new samplesActions.ExportExcelFileSuccess();
                }),
                catchError(() => of(new samplesActions.ExportExcelFileFailure({
                    message: 'Es gab einen Fehler beim Exportieren der Datei.',
                    type: AlertType.ERROR
                })))
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
                catchError(() => of(new coreActions.DisplayBanner({ predefined: 'sendFailure' })))
            );
        }
        )
    );

    @Effect()
    sendSamplesInitation$ = this.actions$.pipe(
        ofType(samplesActions.SamplesActionTypes.SendSamplesInitiate),
        pluck('payload'),
        switchMap((validationRequest: IValidationRequest) => {
            return this.dataService.validateSampleData(validationRequest).pipe(
                tap((annotatedSamples: IAnnotatedSampleData[]) => {
                    this.store.dispatch(new samplesActions.ValidateSamplesSuccess(annotatedSamples));
                }),
                catchError(() => of(new coreActions.DisplayBanner({ predefined: 'sendFailure' })))
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
}
