import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { concat, EMPTY, Observable, of } from 'rxjs';
import { catchError, concatMap, endWith, first, map, startWith } from 'rxjs/operators';
import { DataService } from '../../core/services/data.service';
import { LogService } from '../../core/services/log.service';
import { hideBannerSOA, showBannerSOA, updateIsBusySOA } from '../../core/state/core.actions';
import { navigateMSA } from '../../shared/navigate/navigate.actions';
import { ExcelFile } from '../model/sample-management.model';
import { SamplesLinkProviderService } from '../link-provider.service';
import { SamplesMainSlice } from '../samples.state';
import { samplesUpdateMainDataSOA, samplesUpdateSamplesSOA } from '../state/samples.actions';
import { selectSamplesMainData } from '../state/samples.selectors';
import { importSamplesMSA } from './import-samples.actions';
import { ExcelVersionError } from '../../core/model/data-service-error';
import { ExcelVersionDialogData, ExcelVersionDialogComponent } from './components/excel-version-dialog.component';
import { DialogService } from '../../shared/dialog/dialog.service';
import { importSamplesWrongVersionDialogStrings } from './import-samples.constants';

@Injectable()
export class ImportSamplesEffects {

    constructor(
        private actions$: Actions,
        private store$: Store<SamplesMainSlice>,
        private dataService: DataService,
        private logger: LogService,
        private samplesLinks: SamplesLinkProviderService,
        private dialogService: DialogService
    ) { }

    importSamples$ = createEffect(() => this.actions$.pipe(
        ofType(importSamplesMSA),
        concatMap(action => this.importSamples(action.excelFile).pipe(
            startWith(
                updateIsBusySOA({ isBusy: true }),
                hideBannerSOA()
            ),
            endWith(
                updateIsBusySOA({ isBusy: false })
            )
        ))
    ));

    private importSamples(excelFile: ExcelFile): Observable<Action> {
        return this.dataService.unmarshalExcel(excelFile).pipe(
            concatMap(sampleSet => concat(
                of(
                    samplesUpdateMainDataSOA({ sampleSet: sampleSet }),
                    navigateMSA({ path: this.samplesLinks.editor })
                ),
                this.importSamplesValidate()
            )),
            catchError((error) => {

                this.logger.error('Failed to import Excel File.', error.stack);

                if (error instanceof ExcelVersionError) {
                    this.logger.warn('Imported Excel file returned with invalid version error');
                    this.openExcelVersionDialog(error);
                    return EMPTY;
                }

                return of(showBannerSOA({ predefined: 'uploadFailure' }));
            })
        );
    }

    private importSamplesValidate(): Observable<Action> {
        return this.store$.select(selectSamplesMainData).pipe(
            first(),
            concatMap(samplesMainData => this.dataService.validateSampleData(samplesMainData).pipe(
                map(samples => samplesUpdateSamplesSOA({ samples: samples })),
                catchError((error) => {
                    this.logger.error('Failed to validate samples.', error.stack);
                    return of(showBannerSOA({ predefined: 'validationFailure' }));
                })
            ))
        );
    }

    private openExcelVersionDialog(error: ExcelVersionError) {
        const strings = importSamplesWrongVersionDialogStrings;
        const version = error.version;
        const dialogData: ExcelVersionDialogData = {
            title: strings.title,
            string1: `${strings.message1} ${version} ${strings.message2}`,
            string2: strings.message3,
            string3: strings.message4,
            link: strings.link,
            string4: strings.message5
        };

        const dialogConfig = {
            data: dialogData,
            height: '36em',
            width: '65em'
        };

        this.dialogService.openDialog(ExcelVersionDialogComponent, dialogConfig);
    }
}
