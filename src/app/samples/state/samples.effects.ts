import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { saveAs } from 'file-saver';
import 'moment/locale/de';
import * as _ from 'lodash';
import * as coreActions from '../../core/state/core.actions';
import { map, catchError, exhaustMap, withLatestFrom, mergeMap, tap } from 'rxjs/operators';
import { SampleSet, MarshalledData } from '../model/sample-management.model';
import { from, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
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
import { ValidateSamples } from '../validate-samples/state/validate-samples.actions';
import { SamplesMainData, selectSamplesMainData } from '../state/samples.reducer';

@Injectable()
export class SamplesMainEffects {

    constructor(
        private actions$: Actions<SamplesMainAction>,
        private dataService: DataService,
        private router: Router,
        private logger: LogService,
        private store$: Store<Samples>
    ) { }

    // ImportExcelFile

    @Effect()
    importExcel$ = this.actions$.pipe(
        ofType<ImportExcelFile>(SamplesMainActionTypes.ImportExcelFile),
        exhaustMap((action) => {
            return from(this.dataService.unmarshalExcel(action.payload)).pipe(
                map((unmarshalledResponse: SampleSet) => {
                    if (unmarshalledResponse.meta.nrl === '') {
                        return (new coreActions.DisplayDialog({
                            // tslint:disable-next-line:max-line-length
                            message: `Das ausgewählte Labor im Kopf Ihres Probeneinsendebogens entspricht keiner der möglichen Vorauswahlen. Bitte wählen Sie ein Labor aus der vorhandenen Liste.`,
                            title: 'Unbekanntes NRL',
                            mainAction: {
                                type: UserActionType.CUSTOM,
                                label: 'Ok',
                                onExecute: () => {
                                    this.store$.dispatch(new ImportExcelFileSuccess(unmarshalledResponse));
                                },
                                component: GenericActionItemComponent,
                                icon: '',
                                color: ColorType.PRIMARY,
                                focused: true
                            }
                        }));
                    }
                    return (new ImportExcelFileSuccess(unmarshalledResponse));
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
            const marshalData: SamplesMainData = selectSamplesMainData(state);
            return from(this.dataService.marshalJSON(marshalData)).pipe(
                map((marshalledData: MarshalledData) => {
                    saveAs(this.b64toBlob(marshalledData.binaryData, marshalledData.mimeType), marshalledData.fileName);
                    return new ExportExcelFileSuccess();
                }),
                catchError((error) => {
                    this.logger.error('Failed to export Excel File', error);
                    return of(new coreActions.DisplayBanner({ predefined: 'exportFailure' }));
                })
            );
        })
    );

    private b64toBlob(b64Data: string, contentType: string = '', sliceSize: number = 512) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
}
