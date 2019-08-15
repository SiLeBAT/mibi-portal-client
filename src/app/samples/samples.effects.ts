import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { saveAs } from 'file-saver';
import 'moment/locale/de';
import * as _ from 'lodash';
import * as coreActions from '../core/state/core.actions';
import { map, catchError, exhaustMap, withLatestFrom, mergeMap, concatAll } from 'rxjs/operators';
import { SampleSet, MarshalledData } from './model/sample-management.model';
import { from, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { DataService } from '../core/services/data.service';
import { LogService } from '../core/services/log.service';
import { ClientError } from '../core/model/client-error';
import { UserActionType, ColorType } from '../shared/model/user-action.model';
import { GenericActionItemComponent } from '../core/presentation/generic-action-item/generic-action-item.component';
import { SamplesMainSlice } from './samples.state';
import {
    SamplesMainAction,
    ImportExcelFileMSA,
    SamplesMainActionTypes,
    UpdateSampleSetSOA,
    ExportExcelFileSSA,
    ShowSamplesSSA
} from './state/samples.actions';
import { ValidateSamplesMSA } from './validate-samples/validate-samples.actions';
import { SamplesMainData } from './state/samples.reducer';
import { selectSamplesMainData } from './state/samples.selectors';

@Injectable()
export class SamplesMainEffects {

    constructor(
        private actions$: Actions<SamplesMainAction>,
        private dataService: DataService,
        private router: Router,
        private logger: LogService,
        private store$: Store<SamplesMainSlice>
    ) { }

    // ImportExcelFile

    @Effect()
    importExcelFile$ = this.actions$.pipe(
        ofType<ImportExcelFileMSA>(SamplesMainActionTypes.ImportExcelFileMSA),
        exhaustMap((action) => {
            return from(this.dataService.unmarshalExcel(action.payload)).pipe(
                map((unmarshalledResponse: SampleSet) => {
                    if (unmarshalledResponse.meta.nrl === '') {
                        return of(new coreActions.DisplayDialogMSA({
                            // tslint:disable-next-line:max-line-length
                            message: `Das ausgewählte Labor im Kopf Ihres Probeneinsendebogens entspricht keiner der möglichen Vorauswahlen. Bitte wählen Sie ein Labor aus der vorhandenen Liste.`,
                            title: 'Unbekanntes NRL',
                            mainAction: {
                                type: UserActionType.CUSTOM,
                                label: 'Ok',
                                onExecute: () => {
                                    this.store$.dispatch(new UpdateSampleSetSOA(unmarshalledResponse));
                                    this.store$.dispatch(new ShowSamplesSSA());
                                    this.store$.dispatch(new coreActions.DestroyBannerSOA());
                                    this.store$.dispatch(new coreActions.UpdateIsBusySOA({ isBusy: false }));
                                },
                                component: GenericActionItemComponent,
                                icon: '',
                                color: ColorType.PRIMARY,
                                focused: true
                            }
                        }));
                    }
                    return of(
                        new UpdateSampleSetSOA(unmarshalledResponse),
                        new ShowSamplesSSA(), new coreActions.DestroyBannerSOA(),
                        new coreActions.UpdateIsBusySOA({ isBusy: false })
                        );
                }),
                concatAll(),
                catchError((error) => {
                    this.logger.error(`Failed to import Excel File. error=${error}`);
                    return of(new coreActions.UpdateIsBusySOA({ isBusy: false }),
                    new coreActions.DisplayBannerSOA({ predefined: 'uploadFailure' })
                    );
                })
            );
        })
    );

    @Effect()
    showSamples$ = this.actions$.pipe(
        ofType<ShowSamplesSSA>(SamplesMainActionTypes.ShowSamplesSSA),
        map(() => {
            this.router.navigate(['/samples']).catch(() => {
                throw new ClientError('Unable to navigate.');
            });
            return of(
                new coreActions.UpdateIsBusySOA({ isBusy: true }),
                new ValidateSamplesMSA()
            );
        }),
        concatAll()
    );

    // ExportExcelFile

    @Effect()
    exportExcelFile$ = this.actions$.pipe(
        ofType<ExportExcelFileSSA>(SamplesMainActionTypes.ExportExcelFileSSA),
        withLatestFrom(this.store$),
        mergeMap(([, state]) => {
            const marshalData: SamplesMainData = selectSamplesMainData(state);
            return from(this.dataService.marshalJSON(marshalData)).pipe(
                map((marshalledData: MarshalledData) => {
                    saveAs(this.b64toBlob(marshalledData.binaryData, marshalledData.mimeType), marshalledData.fileName);
                    return new coreActions.UpdateIsBusySOA({ isBusy: false });
                }),
                catchError((error) => {
                    this.logger.error('Failed to export Excel File', error);
                    return of(
                        new coreActions.UpdateIsBusySOA({ isBusy: false }),
                        new coreActions.DisplayBannerSOA({ predefined: 'exportFailure' })
                    );
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
