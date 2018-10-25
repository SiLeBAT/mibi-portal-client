import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import {
    IAnnotatedSampleData, IColConfig, ITableDataOutput
} from '../../model/sample-management.model';
import { map, takeWhile, tap, withLatestFrom } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { GuardedUnloadComponent } from '../../../shared/container/guarded-unload.component';
import { Store, select } from '@ngrx/store';
import * as fromSamples from '../../state/samples.reducer';
import * as samplesActions from '../../state/samples.actions';
import * as fromCore from '../../../core/state/core.reducer';
import * as fromUser from '../../../user/state/user.reducer';
import { IModal } from '../../../core/model/modal.model';
import { ConfirmationService, ResolveEmit } from '@jaspero/ng-confirmations';
import { AlertType } from '../../../core/model/alert.model';
import { IFormViewModel, IFormRowViewModel } from '../../presentation/data-grid/data-grid.component';
import { ToolTipType } from '../../../shared/model/tooltip.model';
import { IUser } from '../../../user/model/user.model';

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
export class DataGridContainerComponent extends GuardedUnloadComponent implements OnInit, OnDestroy {

    viewModel$: Observable<IFormViewModel>;
    private hasData: boolean = true;
    private currentUser: IUser | null;
    private componentActive: boolean = true;
    // TODO: HTML tags in Text?  Formatting shoule be handled by CSS.
    columnConfigArray: IColConfig[] = [
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

    constructor(
        private confirmationService: ConfirmationService,
        private store: Store<fromSamples.IState>) {
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
                (dataStateCombine: [IAnnotatedSampleData[], fromSamples.IState]) => {
                    if (dataStateCombine[0]) {
                        return this.createViewModel(dataStateCombine);
                    }
                    return {
                        data: []
                    };
                }
            )
        );
        this.store.pipe(select(fromUser.getCurrentUser),
            takeWhile(() => this.componentActive))
            .subscribe(
                (user: IUser | null) => this.currentUser = user
            );
        this.store.pipe(select(fromCore.getModal),
            takeWhile(() => this.componentActive))
            .subscribe(
                (modal: IModal) => {
                    if (modal.show) {
                        this.confirmationService.create(modal.title, modal.message, modal.config).subscribe((ans: ResolveEmit) => {
                            if (ans.resolved) {
                                if (this.currentUser) {
                                    this.store.dispatch(new samplesActions.SendSamplesFromStore(this.currentUser));
                                }
                            } else {
                                this.store.dispatch(new samplesActions.SendSamplesFailure({
                                    message: 'Es wurden keine Probendaten an das BfR gesendet',
                                    type: AlertType.ERROR
                                }));
                            }
                        });
                    }
                }
            );
    }

    ngOnDestroy(): void {
        this.componentActive = false;
    }

    onValueChanged(tableData: ITableDataOutput) {
        this.store.dispatch(new samplesActions.ChangeFieldValue(tableData.changed));
    }

    unloadGuard() {
        return this.hasData;
    }

    private createViewModel(dataStateCombine: [IAnnotatedSampleData[], fromSamples.IState]) {
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
                    if (result[k]) {
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
