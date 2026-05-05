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
import { InvalidEmailError } from 'app/core/model/client-error';

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

    private readonly maxDataRows = 500;

    private importSamples(excelFile: ExcelFile): Observable<Action> {
        return this.dataService.unmarshalExcel(excelFile).pipe(
            concatMap(sampleSet => {
                const tooManyRows = sampleSet.samples.length > this.maxDataRows;
                const processedSampleSet = tooManyRows
                    ? { ...sampleSet, samples: sampleSet.samples.slice(0, this.maxDataRows) }
                    : sampleSet;

                return concat(
                    of(
                        samplesUpdateMainDataSOA({ sampleSet: processedSampleSet }),
                        navigateMSA({ path: this.samplesLinks.editor })
                    ),
                    tooManyRows ? of(showBannerSOA({ predefined: 'tooManyDataRows' })) : EMPTY,
                    this.importSamplesValidate()
                );
            }),
            catchError((error) => {

                this.logger.error('Failed to import Excel File.', error.stack);

                if (error instanceof ExcelVersionError) {
                    this.logger.warn('Imported Excel file returned with invalid version error');
                    this.openExcelVersionDialog(error);
                    return EMPTY;
                }

                if (error instanceof InvalidEmailError) {
                    this.logger.warn('Imported Excel file returned with invalid email address');
                    return of(showBannerSOA({ predefined: 'invalidEmailFailure' }));
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
        const uploadedVersion = error.version;
        const currentVersions = error.currentVersions;
        const versionNumber = Number.parseInt(uploadedVersion, 10);
        const useAlternativeTexts = versionNumber >= 17;

        let dialogData: ExcelVersionDialogData;
        let dialogHeight: string;

        if (useAlternativeTexts) {
            const currentVersion = currentVersions.length > 0
                ? String(Math.max(...currentVersions.map(v => Number.parseInt(v, 10))))
                : '';
            dialogData = {
                title: strings.title,
                cancelButtonText: strings.cancelButtonText,
                useAlternativeTexts: true,
                alternativeText2a: `${strings.alternativeMessage2aPart1} ${uploadedVersion} ${strings.alternativeMessage2aPart2}`,
                alternativeText3a: `${strings.alternativeMessage3aPart1} ${currentVersion} ${strings.alternativeMessage3aPart2}`
            };
            dialogHeight = '32em';
        } else {
            const currentVersion = currentVersions.length > 0
                ? String(Math.min(...currentVersions.map(v => Number.parseInt(v, 10))))
                : '';
            dialogData = {
                title: strings.title,
                cancelButtonText: strings.cancelButtonText,
                useAlternativeTexts: false,
                string0: strings.message0,
                string1: `${strings.message1} ${uploadedVersion} ${strings.message2}`,
                string2: strings.message3,
                string3: strings.message4,
                string4: strings.message5,
                link: strings.link,
                string5: `${strings.message6Part1} ${currentVersion} ${strings.message6Part2}`
            };
            dialogHeight = '52em';
        }

        const dialogConfig = {
            data: dialogData,
            height: dialogHeight,
            width: '65em'
        };

        this.dialogService.openDialog(ExcelVersionDialogComponent, dialogConfig);
    }
}
