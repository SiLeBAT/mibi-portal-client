import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import {
    ColConfig, TableDataOutput, SamplePropertyValues, Sample
} from '../../model/sample-management.model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Store, select, createSelector } from '@ngrx/store';
import * as samplesActions from '../../state/samples.actions';
import { IFormViewModel, IFormRowViewModel } from '../../presentation/data-grid/data-grid.component';
import { ToolTipType } from '../../../shared/model/tooltip.model';
import { SamplesMainSlice } from '../../samples.state';
import { selectImportedFileData, selectFormData } from '../../state/samples.selectors';

enum AlteredField {
    WARNING = 'warn',
    ERROR = 'error',
    AUTOCORRECTED = 'corrected'
}

@Component({
    selector: 'mibi-data-grid-container',
    template: `
    <mibi-data-grid
        [colConfig] = "columnConfigArray"
        [viewModel] = "viewModel$ | async"
        (valueChanged)="onValueChanged($event)">
    </mibi-data-grid>`
})
export class DataGridContainerComponent implements OnInit {

    viewModel$: Observable<IFormViewModel>;

    columnConfigArray: ColConfig[] = [
        {
            id: 'nrl',
            title: 'NRL',
            readOnly: true
        },
        {
            id: 'sample_id',
            title: 'Ihre Proben&shy;ummer'
        },
        {
            id: 'sample_id_avv',
            title: 'Probe&shy;nummer nach AVVData'
        },
        {
            id: 'pathogen_adv',
            title: 'Erreger (Text aus ADV-Kat-Nr.16)'
        },
        {
            id: 'pathogen_text',
            title: 'Erreger (Textfeld / Ergänzung)'
        },
        {
            id: 'sampling_date',
            title: 'Datum der Probe&shy;nahme'
        },
        {
            id: 'isolation_date',
            title: 'Datum der Isolierung'
        },
        {
            id: 'sampling_location_adv',
            title: 'Ort der Probe&shy;nahme (Code aus ADV-Kat-Nr.9)'
        },
        {
            id: 'sampling_location_zip',
            title: 'Ort der Probe&shy;nahme (PLZ)'
        },
        {
            id: 'sampling_location_text',
            title: 'Ort der Probe&shy;nahme (Text)'
        },
        {
            id: 'topic_adv',
            title: 'Oberbe&shy;griff (Kodier&shy;system) der Matrizes (Code aus ADV-Kat-Nr.2)'
        },
        {
            id: 'matrix_adv',
            title: 'Matrix Code (Code aus ADV&shy;Kat&shy;Nr.3)'
        },
        {
            id: 'matrix_text',
            title: 'Matrix (Textfeld / Ergänzung)'
        },
        {
            id: 'process_state_adv',
            title: 'Ver&shy;arbeitungs&shy;zustand (Code aus ADV-Kat&shy;Nr.12)'
        },
        {
            id: 'sampling_reason_adv',
            title: 'Grund der Probe&shy;nahme (Code aus ADV-Kat&shy;Nr.4)'
        },
        {
            id: 'sampling_reason_text',
            title: 'Grund der Probe&shy;nahme (Textfeld / Ergänzung)'
        },
        {
            id: 'operations_mode_adv',
            title: 'Betriebsart (Code aus ADV-Kat-Nr.8)'
        },
        {
            id: 'operations_mode_text',
            title: 'Betriebsart (Textfeld / Ergänzung)'
        },
        {
            id: 'vvvo',
            title: 'VVVO-Nr / Herde'
        },
        {
            id: 'comment',
            title: 'Bemerkung (u.a. Untersuchungs&shy;programm)'
        }
    ];

    constructor(private store$: Store<SamplesMainSlice>) {
    }

    ngOnInit(): void {
        this.viewModel$ = this.store$.pipe(
            select(createSelector(
                selectFormData,
                selectImportedFileData,
                (samples, sampleData) => ({ samples, sampleData })
            )),
            map(({ samples, sampleData }) => {
                if (samples) {
                    return this.createViewModel(samples, sampleData);
                }
                return {
                    data: []
                };
            })
        );
    }

    onValueChanged(tableData: TableDataOutput) {
        this.store$.dispatch(new samplesActions.UpdateSampleDataEntrySOA(tableData.changed));
    }
    private createViewModel(formSamples: Sample[], importedFileData: SamplePropertyValues[]) {
        const rows = formSamples.map(
            (row: Sample, index) => {
                const result: IFormRowViewModel = {};

                _.forEach(row.sampleData, (samplePropertyEntry, sampleProperty) => {
                    result[sampleProperty] = {
                        id: sampleProperty,
                        value: samplePropertyEntry.value,
                        correctionOffer: samplePropertyEntry.correctionOffer,
                        editMessage: []
                    };
                    if (result[sampleProperty].value !== importedFileData[index][sampleProperty]) {
                        result[sampleProperty].editMessage = ['Ursprünglich: ' +
                            (importedFileData[index][sampleProperty] || '&lt;leer&gt;')];
                    }
                    if (samplePropertyEntry.errors.length > 0) {
                        result[sampleProperty].errors = {
                            severity: this.getFieldBackground(samplePropertyEntry.errors.map(error => error.level)),
                            errorMessage: samplePropertyEntry.errors.filter(error => error.level === ToolTipType.ERROR)
                                .map(error => error.message),
                            warningMessage: samplePropertyEntry.errors.filter(error => error.level === ToolTipType.WARNING)
                                .map(error => error.message),
                            autoCorrectMessage: samplePropertyEntry.errors.filter(error => error.level === ToolTipType.INFO)
                                .map(error => error.message)
                        };
                    }

                });

                result.nrl = {
                    id: 'nrl',
                    value: row.sampleMeta.nrl,
                    correctionOffer: [],
                    editMessage: []
                };

                return result;
            }
        );
        return {
            data: rows
        };

    }

    private getFieldBackground(status: number[]): string {
        if (status.includes(2)) {
            return AlteredField.ERROR;
        }
        if (status.includes(1)) {
            return AlteredField.WARNING;
        }
        if (status.includes(4)) {
            return AlteredField.AUTOCORRECTED;
        }
        return '';
    }
}
