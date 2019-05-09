import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import 'moment/locale/de';
import * as _ from 'lodash';
import * as coreActions from '../../core/state/core.actions';
import { map, catchError, exhaustMap, withLatestFrom, mergeMap, tap } from 'rxjs/operators';
import { ExcelFileBlob, ExcelData } from '../model/sample-management.model';
import { ExcelConverterService } from '../services/excel-converter.service';
import { from, of } from 'rxjs';
import { Store, select } from '@ngrx/store';
import * as fromSamples from '../state/samples.reducer';
import * as fromUser from '../../user/state/user.reducer';
import { Router } from '@angular/router';
import { ExcelToJsonService } from '../services/excel-to-json.service';
import { LogService } from '../../core/services/log.service';
import { ClientError } from '../../core/model/client-error';
import { UserActionType, ColorType } from '../../shared/model/user-action.model';
import { GenericActionItemComponent } from '../../core/presentation/generic-action-item/generic-action-item.component';
import { Samples } from '../samples.store';
import {
    SamplesMainAction,
    ImportExcelFile,
    SamplesMainActionTypes,
    ImportExcelFileSuccess,
    ExportExcelFile,
    ExportExcelFileSuccess
} from './samples.actions';
import { ValidateSamples } from '../validate-samples/store/validate-samples.actions';
import { selectCommentDialog } from '../comment-dialog/store/comment-dialog.selectors';

@Injectable()
export class SamplesMainEffects {

    constructor(
        private actions$: Actions<SamplesMainAction>,
        private excelConverterService: ExcelConverterService,
        private excelToJsonService: ExcelToJsonService,
        private router: Router,
        private logger: LogService,
        private store$: Store<Samples & fromUser.State>
        ) {}

    // ImportExcelFile

    @Effect()
    importExcelFile$ = this.actions$.pipe(
        ofType<ImportExcelFile>(SamplesMainActionTypes.ImportExcelFile),
        exhaustMap((action) => {
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
                                    this.store$.dispatch(new ImportExcelFileSuccess(excelData));
                                },
                                component: GenericActionItemComponent,
                                icon: '',
                                color: ColorType.PRIMARY,
                                focused: true
                            }
                        }));
                    }
                    return (new ImportExcelFileSuccess(excelData));
                }),
                catchError((error) => {
                    this.logger.error(`Failed to import Excel File. error=${error}`);
                    return of(new coreActions.DisplayBanner({ predefined: 'uploadFailure' }));
                })
            );
        })
    );

    @Effect()
    importExcelFileSuccess$ = this.actions$.pipe(
        ofType<ImportExcelFileSuccess>(SamplesMainActionTypes.ImportExcelFileSuccess),
        map(() => {
            this.router.navigate(['/samples']).catch(() => {
                throw new ClientError('Unable to navigate.');
            });
            return new ValidateSamples(SamplesMainActionTypes.ImportExcelFile);
        })
    );

    // ExportExcelFile

    @Effect()
    exportExcelFile$ = this.actions$.pipe(
        ofType<ExportExcelFile>(SamplesMainActionTypes.ExportExcelFile),
        withLatestFrom(this.store$),
        mergeMap(([, state]) => {
            const filenameAddon = '.MP_' + moment().unix();
            const sampleSheet = fromSamples.selectSamplesMainData(state);
            return from(this.excelConverterService.convertToExcel(sampleSheet, filenameAddon)).pipe(
                map((excelFileBlob: ExcelFileBlob) => {
                    saveAs(excelFileBlob.blob, excelFileBlob.fileName);
                    return new ExportExcelFileSuccess();
                }),
                catchError((error) => {
                    this.logger.error('Failed to export Excel File', error);
                    return of(new coreActions.DisplayBanner({ predefined: 'exportFailure' }));
                })
            );
        })
    );
}
