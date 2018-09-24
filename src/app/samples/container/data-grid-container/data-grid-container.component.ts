import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { ITableDataOutput, IErrRow, IErrCol, IStatusComments, IColConfig } from '../../presentation/data-grid/data-grid.component';
import {
    IValidationErrorCollection,
    IAutoCorrectionEntry, IAnnotatedSampleData, SampleData, ChangedValueCollection
} from '../../model/sample-management.model';
import { map, takeWhile, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CanReloadComponent } from '../../../shared/container/can-reload.component';
import { Store, select } from '@ngrx/store';
import * as fromSamples from '../../state/samples.reducer';
import * as samplesActions from '../../state/samples.actions';
import * as fromCore from '../../../core/state/core.reducer';
import * as fromUser from '../../../user/state/user.reducer';
import { IModal } from '../../../core/model/modal.model';
import { ConfirmationService, ResolveEmit } from '@jaspero/ng-confirmations';
import { AlertType } from '../../../core/model/alert.model';
import { IUser } from '../../../user/model/models';

@Component({
    selector: 'mibi-data-grid-container',
    template: `
    <mibi-data-grid
        [colTitles] = "getColTitles()"
        [errorData] = "errors$ | async"
        [changedData] = "changedData$ | async"
        [data] = "data$ | async"
        (valueChanged)="onValueChanged($event)">
    </mibi-data-grid>`
})
export class DataGridContainerComponent extends CanReloadComponent implements OnInit, OnDestroy {

    changedData$: Observable<ChangedValueCollection[]>;
    errors$: Observable<IErrRow>;
    data$: Observable<SampleData[]>;
    private reload: boolean = true;
    private currentUser: IUser | null;
    private componentActive: boolean = true;
    // TODO: HTML tags in Text?  Formatting shoule be handled by CSS.
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

    constructor(
        private confirmationService: ConfirmationService,
        private store: Store<fromSamples.IState>) {
        super();
    }

    ngOnInit(): void {
        this.changedData$ = this.getChangedData();
        this.errors$ = this.getErrors();
        this.data$ = this.getData().pipe(
            tap(data => {
                if (data) {
                    this.reload = false;
                } else {
                    this.reload = true;
                }
            })
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

    // TODO: IS this needed?
    canReload() {
        return this.reload;
    }

    getColTitles() {
        return this.columnConfigArray.map(c => c.title);
    }

    private getStoreEntries(): Observable<IAnnotatedSampleData[]> {
        return this.store.pipe(select(fromSamples.getAnnotatedSampleData));
    }

    // TODO: Possibly create a selector?
    private getErrors() {
        return this.getStoreEntries().pipe(
            map((entry: IAnnotatedSampleData[]) => this.parseErrors(entry.map(e => e.errors), entry.map(e => e.corrections)))
        );
    }

    // TODO: Possibly create a selector?
    private getChangedData() {
        return this.getStoreEntries().pipe(
            map((entry: IAnnotatedSampleData[]) => entry.map(e => e.edits)));
    }

    // TODO: Possibly create a selector?
    private getData() {
        return this.getStoreEntries().pipe(
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
