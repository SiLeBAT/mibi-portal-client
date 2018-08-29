import { Component } from '@angular/core';
import * as _ from 'lodash';
import { SampleStore } from '../../services/sample-store.service';
import { ValidationService } from '../../services/validation.service';
import { ITableDataOutput, IErrRow, IErrCol, IStatusComments, IColConfig } from '../../presentation/data-grid/data-grid.component';
import { CanReloadComponent } from '../../../core/can-deactivate/can-reload.component';
import {
    IValidationErrorCollection,
    IAutoCorrectionEntry, IAnnotatedSampleData, SampleData, ChangedValueCollection
} from '../../models/sample-management.model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-data-grid-container',
    template: `
    <app-data-grid
        [colTitles] = "getColTitles()"
        [errorData] = "errors$ | async"
        [changedData] = "changedData$ | async"
        [data] = "data$ | async"
        (valueChanged)="onValueChanged($event)">
    </app-data-grid>`
})
export class DataGridContainerComponent extends CanReloadComponent {

    changedData$: Observable<ChangedValueCollection[]>;
    errors$: Observable<IErrRow>;
    data$: Observable<SampleData[]>;
    // FIXME: HTML tags in Text?  Formatting shoule be handled by CSS.
    private columnConfigArray: IColConfig[] = [
        {
            id: 'sample_id',
            title: 'Ihre<br>Proben-<br>ummer'
        },
        {
            id: 'sample_id_avv',
            title: 'Probe-<br>nummer<br>nach<br>AVVData'
        },
        {
            id: 'pathogen_adv',
            title: 'Erreger<br>(Text aus<br>ADV-Kat-Nr.16)'
        },
        {
            id: 'pathogen_text',
            title: 'Erreger<br>(Textfeld/<br>Ergänzung)'
        },
        {
            id: 'sampling_date',
            title: 'Datum der<br>Probenahme'
        },
        {
            id: 'isolation_date',
            title: 'Datum der<br>Isolierung'
        },
        {
            id: 'sampling_location_adv',
            title: 'Ort der<br>Probe-<br>nahme<br>(Code aus<br>ADV-Kat-<br>Nr.9)'
        },
        {
            id: 'sampling_location_zip',
            title: 'Ort der<br>Probe-<br>nahme<br>(PLZ)'
        },
        {
            id: 'sampling_location_text',
            title: 'Ort der<br>Probe-<br>nahme<br>(Text)'
        },
        {
            id: 'topic_adv',
            title: 'Oberbe-<br>griff<br>(Kodier-<br>system)<br>der<br>Matrizes<br>(Code aus<br>ADV-Kat-<br>Nr.2)'
        },
        {
            id: 'matrix_adv',
            title: 'Matrix<br>Code<br>(Code<br>aus<br>ADV-<br>Kat-<br>Nr.3)'
        },
        {
            id: 'matrix_text',
            title: 'Matrix<br>(Textfeld/<br>Ergänzung)'
        },
        {
            id: 'process_state_adv',
            title: 'Ver-<br>arbeitungs-<br>zustand<br>(Code aus<br>ADV-Kat-<br>Nr.12)'
        },
        {
            id: 'sampling_reason_adv',
            title: 'Grund<br>der<br>Probe-<br>nahme<br>(Code<br>aus<br>ADV-Kat-<br>Nr.4)'
        },
        {
            id: 'sampling_reason_text',
            title: 'Grund der<br>Probe-<br>nahme<br>(Textfeld/<br>Ergänzung)'
        },
        {
            id: 'operations_mode_adv',
            title: 'Betriebsart<br>(Code aus<br>ADV-Kat-Nr.8)'
        },
        {
            id: 'operations_mode_text',
            title: 'Betriebsart<br>(Textfeld/<br>Ergänzung)'
        },
        {
            id: 'vvvo',
            title: 'VVVO-Nr /<br>Herde'
        },
        {
            id: 'comment',
            title: 'Bemerkung<br>(u.a.<br>Untersuchungs-<br>programm)'
        }
    ];

    constructor(public sampleStore: SampleStore,
        private validationService: ValidationService) {
        super();
        this.changedData$ = this.getChangedData();
        this.errors$ = this.getErrors();
        this.data$ = this.getData();
    }

    onValueChanged(tableData: ITableDataOutput) {
        const {
            rowIndex,
            columnId,
            originalValue,
            newValue
        } = tableData.changed;

        if (originalValue !== newValue) {

            const newEntries = this.sampleStore.state.entries.map((e: IAnnotatedSampleData, i: number) => {
                const newEdits = { ...e.edits };

                if (i === rowIndex) {
                    if (newEdits[columnId]) {
                        if (newEdits[columnId] === newValue) {
                            newEdits[columnId] = '';
                        }
                    } else {
                        newEdits[columnId] = originalValue;
                    }
                }

                return {
                    data: tableData.data[i],
                    errors: e.errors,
                    edits: newEdits,
                    corrections: e.corrections
                };
            });

            const newState = {
                ...this.sampleStore.state,
                ...{
                    entries: newEntries
                }
            };
            this.sampleStore.setState(newState);
        }
    }

    // TODO: IS this needed?
    canReload() {
        return !this.validationService.isValidating;
    }

    getColTitles() {
        return this.columnConfigArray.map(c => c.title);
    }

    private getErrors() {
        return this.sampleStore.annotatedSampleData$.pipe(
            map((entry: IAnnotatedSampleData[]) => this.parseErrors(entry.map(e => e.errors), entry.map(e => e.corrections)))
        );
    }

    private getChangedData() {
        return this.sampleStore.annotatedSampleData$.pipe(
            map((entry: IAnnotatedSampleData[]) => entry.map(e => e.edits)));
    }

    private getData() {
        return this.sampleStore.annotatedSampleData$.pipe(
            map((entry: IAnnotatedSampleData[]) => entry.map(e => e.data)));
    }

    private parseErrors(errors: IValidationErrorCollection[], corrections: IAutoCorrectionEntry[][]): IErrRow {
        const errData: IErrRow = {};

        _.forEach(errors, (error, row) => {
            const errRow: IErrCol = {};
            _.forEach(error, (errList, colName) => {
                const col = _.findIndex(this.columnConfigArray.map(c => c.id), header => header === colName);
                const errCol: IStatusComments = {};
                _.forEach(errList, (errItem) => {
                    const currentLevel = errItem['level'];
                    let commentList: any[];
                    if (!errCol[currentLevel]) {
                        commentList = [];
                        errCol[currentLevel] = commentList;
                    } else {
                        commentList = errCol[currentLevel];
                    }
                    commentList.push(errItem['message']);
                });
                errRow[col] = errCol;
            });
            errData[row] = errRow;
        });

        const numbersOnly = new RegExp(/^\d+?/);
        _.forEach(corrections, (correct, row) => {
            _.forEach(correct, (correctedEntry: IAutoCorrectionEntry, colIndex: number) => {

                const newColIn = _.findIndex(this.columnConfigArray.map(c => c.id), header => header === correctedEntry.field);
                if (!errData[row][newColIn]) {
                    errData[row][newColIn] = {};
                }
                let message =
                    // tslint:disable-next-line:max-line-length
                    `Erreger erkannt. Ursprünglicher Text ${correctedEntry.original} wurde durch den Text aus ADV-Katalog Nr. 16 ersetzt.`;
                if (numbersOnly.test(correctedEntry.original)) {
                    message =
                        // tslint:disable-next-line:max-line-length
                        `ADV-16-Code ${correctedEntry.original} wurde erkannt & durch den entsprechenden ADV-Text ${correctedEntry.corrected} ersetzt.`;
                }
                errData[row][newColIn][4] = [
                    message
                ];

            });
        });

        return errData;
    }
}
