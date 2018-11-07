import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import {
    AnnotatedSampleData, ColConfig, TableDataOutput
} from '../../model/sample-management.model';
import { map, tap, withLatestFrom } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { GuardedUnloadComponent } from '../../../shared/container/guarded-unload.component';
import { Store, select } from '@ngrx/store';
import * as fromSamples from '../../state/samples.reducer';
import * as samplesActions from '../../state/samples.actions';
import { IFormViewModel, IFormRowViewModel } from '../../presentation/data-grid/data-grid.component';
import { ToolTipType } from '../../../shared/model/tooltip.model';

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
export class DataGridContainerComponent extends GuardedUnloadComponent implements OnInit {

    viewModel$: Observable<IFormViewModel>;
    private hasData: boolean = true;

    columnConfigArray: ColConfig[] = [
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

    constructor(private store: Store<fromSamples.State>) {
        super();
    }

    ngOnInit(): void {
        this.viewModel$ = this.store.pipe(select(fromSamples.getFormData)).pipe(
            tap(data => {
                if (data) {
                    this.hasData = false;
                } else {
                    this.hasData = true;
                }
            }),
            withLatestFrom(this.store),
            map(
                (dataStateCombine: [AnnotatedSampleData[], fromSamples.State]) => {
                    if (dataStateCombine[0]) {
                        return this.createViewModel(dataStateCombine);
                    }
                    return {
                        data: []
                    };
                }
            )
        );
    }

    onValueChanged(tableData: TableDataOutput) {
        this.store.dispatch(new samplesActions.ChangeFieldValue(tableData.changed));
    }

    unloadGuard() {
        return this.hasData;
    }

    private createViewModel(dataStateCombine: [AnnotatedSampleData[], fromSamples.State]) {
        const rows = dataStateCombine[0].map(
            (row, index) => {
                const result: IFormRowViewModel = {};

                // Add values
                _.forEach(row.data, (v, k) => {
                    result[k] = {
                        id: k,
                        value: v,
                        correctionOffer: [],
                        editMessage: []
                    };
                });

                // Add correction Offers
                row.corrections.forEach(
                    correction => {
                        if (result[correction.field]) {
                            result[correction.field].correctionOffer = correction.correctionOffer;
                        }
                    }
                );

                // Add errors
                _.forEach(row.errors, (v, k) => {
                    if (result[k]) {
                        result[k].errors = {
                            severity: this.getFieldBackground(v.map(error => error.level)),
                            errorMessage: v.filter(error => error.level === ToolTipType.ERROR).map(error => error.message),
                            warningMessage: v.filter(
                                error => error.level === ToolTipType.WARNING).map(error => error.message),
                            autoCorrectMessage: v.filter(
                                error => error.level === ToolTipType.INFO).map(error => error.message)
                        };
                    }
                });

                // Add edits
                _.forEach(row.edits, (v, k) => {
                    if (result[k] && result[k].value !== dataStateCombine[1].samples.importedData[index][k]) {
                        result[k].editMessage = ['Ursprünglich: ' +
                            (dataStateCombine[1].samples.importedData[index][k] || '&lt;leer&gt;')];
                    }
                });
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
