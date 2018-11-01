import { Component, OnInit, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { SampleData, ISampleSheet } from '../../../samples/model/sample-management.model';
import { Store, select } from '@ngrx/store';
import * as fromSamples from '../../../samples/state/samples.reducer';
import * as fromUser from '../../../user/state/user.reducer';
import * as fromCore from '../../state/core.reducer';
import * as samplesActions from '../../../samples/state/samples.actions';
import { takeWhile, map } from 'rxjs/operators';
import { Observable, of, combineLatest } from 'rxjs';
import { IUser } from '../../../user/model/user.model';
import { ActionItemConfiguration, ActionItemType } from '../../model/action-items.model';
import { GenericActionItemComponent } from '../../presentation/generic-action-item/generic-action-item.component';
import { UploadActionItemComponent } from '../../presentation/upload-action-item/upload-action-item.component';

// TODO: Should have pass navBarConfig to presentational component, to make the presentational component more generic
@Component({
    selector: 'mibi-action-item-list-container',
    template: `<mibi-action-item-list
    [configuration$]="config$">
    </mibi-action-item-list>`
})
export class ActionItemListContainerComponent implements OnInit, OnDestroy {

    config$: Observable<ActionItemConfiguration[]>;
    private configuration: ActionItemConfiguration[] = [{
        label: 'Validieren',
        type: ActionItemType.VALIDATE,
        onClick: this.onValidate.bind(this),
        component: GenericActionItemComponent,
        icon: 'spellcheck'
    },
    {
        label: 'Hochladen',
        type: ActionItemType.UPLOAD,
        onClick: this.onImport.bind(this),
        component: UploadActionItemComponent,
        icon: 'get_app'
    },
    {
        label: 'Exportieren',
        type: ActionItemType.EXPORT,
        onClick: this.onExport.bind(this),
        component: GenericActionItemComponent,
        icon: 'save'
    },
    {
        label: 'Senden',
        type: ActionItemType.SEND,
        onClick: this.onSend.bind(this),
        component: GenericActionItemComponent,
        icon: 'send'
    }];

    private currentUser: IUser | null;
    private sampleData: SampleData[];
    private sampleSheet: ISampleSheet;
    private componentActive: boolean = true;
    private nrl: string = '';

    constructor(
        private store: Store<fromSamples.State>) { }

    ngOnInit() {

        this.store.pipe(select(fromSamples.getDataValues),
            takeWhile(() => this.componentActive)).subscribe(
                (data: SampleData[]) => this.sampleData = data
            );

        this.store.pipe(select(fromSamples.getSamplesFeatureState),
            takeWhile(() => this.componentActive)).subscribe(
                (sheet: ISampleSheet) => this.sampleSheet = sheet
            );

        this.store.pipe(
            select(fromUser.getCurrentUser),
            takeWhile(() => this.componentActive)).subscribe(
                (cu) => this.currentUser = cu
            );

        this.store.pipe(select(fromSamples.getNRL),
            takeWhile(() => this.componentActive)).subscribe(
                (nrl: string) => this.nrl = nrl
            );

        this.config$ = combineLatest(of(this.configuration),
            this.store.pipe(select(fromCore.getEnabledActionItems)),
            this.store.pipe(select(fromSamples.hasEntries)),
            this.store.pipe(select(fromUser.getCurrentUser))).pipe(
                map(combined => {

                    const [configuration, enabled, hasEntries, currentUser] = combined;
                    let newConfig = [...configuration];
                    if (!hasEntries || !enabled.length) {
                        newConfig = [];
                    }
                    if (!currentUser) {
                        newConfig = _.filter(newConfig, (c: ActionItemConfiguration) => c.type !== ActionItemType.SEND);

                    }
                    if (enabled.length) {
                        newConfig = _.filter(newConfig, (c: ActionItemConfiguration) => {
                            return _.includes(enabled, c.type);
                        });
                    }
                    return newConfig;
                })
            );
    }

    ngOnDestroy(): void {
        this.componentActive = false;
    }

    onValidate() {
        this.store.dispatch(new samplesActions.ValidateSamples({
            data: this.sampleData,
            meta: {
                state: this.currentUser ? this.currentUser.institution.stateShort : '',
                nrl: this.nrl
            }
        }));
    }

    onExport() {
        this.store.dispatch(new samplesActions.ExportExcelFile(this.sampleSheet));
    }

    onImport(file: File) {
        this.store.dispatch(new samplesActions.ImportExcelFile(file));
    }

    onSend() {
        this.store.dispatch(new samplesActions.SendSamplesInitiate({
            data: this.sampleData,
            meta: {
                state: this.currentUser ? this.currentUser.institution.stateShort : '',
                nrl: this.nrl
            }
        }));
    }
}
