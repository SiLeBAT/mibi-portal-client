import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { saveAs } from 'file-saver';

import * as samplesActions from './samples.actions';
import { map, concatMap, catchError, exhaustMap, withLatestFrom, switchMap, mergeMap, pluck } from 'rxjs/operators';
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
@Injectable()
export class SamplesEffects {

    constructor(private actions$: Actions,
        private excelConverterService: ExcelConverterService,
        private sendSampleService: SendSampleService,
        private excelToJsonService: ExcelToJsonService,
        private dataService: DataService,
        private router: Router,
        private store: Store<fromSamples.IState>) {
    }

    @Effect()
    validateSamples$ = this.actions$.pipe(
        ofType(samplesActions.SamplesActionTypes.ValidateSamples),
        concatMap((action: samplesActions.ValidateSamples) => this.dataService.validateSampleData(action.payload).pipe(
            map((annotatedSamples: IAnnotatedSampleData[]) => {
                return (new samplesActions.ValidateSamplesSuccess(annotatedSamples));
            }),
            catchError(err => of(new samplesActions.ValidateSamplesFailure(err)))
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
                catchError(err => of(new samplesActions.ImportExcelFileFailure(err)))
            );
        })
    );

    @Effect()
    importExcelSuccess$ = this.actions$.pipe(
        ofType(samplesActions.SamplesActionTypes.ImportExcelFileSuccess),
        withLatestFrom(this.store),
        map((actionStoreCombine: [samplesActions.ExportExcelFileSuccess, fromSamples.IState & fromUser.IState]) => {
            this.router.navigate(['/samples']).catch(() => {
                throw new Error('Unable to navigate.');
            });
            return new samplesActions.ValidateSamples({
                data: actionStoreCombine[1].samples.formData.map(e => e.data),
                meta: {
                    state: actionStoreCombine[1].user.currentUser ?
                        (actionStoreCombine[1].user.currentUser as IUser).institution.stateShort : ''
                }
            });
        })
    );

    @Effect()
    exportExcel$ = this.actions$.pipe(
        ofType(samplesActions.SamplesActionTypes.ExportExcelFile),
        exhaustMap((action: samplesActions.ExportExcelFile) =>
            from(this.excelConverterService.convertToExcel(action.payload)).pipe(
                map((excelFileBlob: IExcelFileBlob) => {
                    saveAs(excelFileBlob.blob, excelFileBlob.fileName);
                    return new samplesActions.ExportExcelFileSuccess();
                }),
                catchError(err => of(new samplesActions.ExportExcelFileFailure(err)))
            ))
    );

    @Effect()
    sendSamplesFromStore$ = this.actions$.pipe(
        ofType(samplesActions.SamplesActionTypes.SendSamplesFromStore),
        withLatestFrom(this.store),
        exhaustMap((actionStoreCombine: [samplesActions.SendSamplesFromStore, fromSamples.IState]) =>
            from(this.sendSampleService.sendData(actionStoreCombine[1].samples, actionStoreCombine[0].payload)).pipe(
                map(() => new samplesActions.SendSamplesSuccess({
                    type: AlertType.SUCCESS,
                    message: `Der Auftrag wurde an das BfR gesendet.
                    Bitte drucken Sie die Exceltabelle in Ihrem Mailanhang
                    aus und legen sie Ihren Isolaten bei.`
                })),
                catchError(err => of(new samplesActions.SendSamplesFailure(err)))
            )
        )
    );

    @Effect()
    sendSamplesInitation$ = this.actions$.pipe(
        ofType(samplesActions.SamplesActionTypes.SendSamplesInitiate),
        withLatestFrom(this.store),
        switchMap((actionStoreCombine: [samplesActions.SendSamplesInitiate, fromSamples.IState & fromUser.IState]) => {
            return this.dataService.validateSampleData(
                {
                    data: actionStoreCombine[0].payload.formData.map(e => e.data),
                    meta: {
                        state: actionStoreCombine[1].user.currentUser ?
                            (actionStoreCombine[1].user.currentUser as IUser).institution.stateShort : ''
                    }
                }).pipe(
                    map((annotatedSamples: IAnnotatedSampleData[]) => {
                        return (new samplesActions.ValidateSamplesSuccess(annotatedSamples));
                    }),
                    catchError(err => of(new samplesActions.ValidateSamplesFailure(err)))
                );
        }),
        ofType(samplesActions.SamplesActionTypes.ValidateSamplesSuccess),
        pluck('payload'),
        mergeMap((annotatedSamples: IAnnotatedSampleData[]) => {
            const hasErrors = annotatedSamples.reduce(
                (acc, entry) => {
                    let count = 0;
                    for (const err of Object.keys(entry.errors)) {
                        count += entry.errors[err].filter(
                            e => e.level === 2
                        ).length;
                    }
                    return acc += count;
                },
                0
            );

            if (hasErrors) {
                return of(new samplesActions.SendSamplesFailure({
                    message: 'Es gibt noch rot gekennzeichnete Fehler. Bitte vor dem Senden korrigieren.',
                    type: AlertType.ERROR
                }));
            } else {
                return of(new samplesActions.SendSamplesConfirm({
                    message: `<p>Ihre Probendaten werden jetzt an das BfR gesendet.</p>
                    <p>Bitte vergessen Sie nicht die Exceltabelle in Ihrem Mailanhang
                    auszudrucken und Ihren Isolaten beizulegen.</p>`,
                    title: 'Senden'
                }));
            }
        }),
        catchError(() => of(new samplesActions.SendSamplesFailure({
            message: 'Es wurden keine Probendaten an das BfR gesendet',
            type: AlertType.ERROR
        })))
    );
}
