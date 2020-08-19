import { Urgency } from './../../model/sample.enums';
import * as _ from 'lodash';
import { map } from 'rxjs/internal/operators/map';
import { takeWhile } from 'rxjs/internal/operators/takeWhile';
import { take } from 'rxjs/internal/operators/take';
import { Observable } from 'rxjs';
import { SendSamplesState } from './../../send-samples/state/send-samples.reducer';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select, createSelector } from '@ngrx/store';
import { selectFormData, selectImportedFileName } from '../../state/samples.selectors';
import { Sample, Analysis, SampleMeta } from '../../model/sample-management.model';
import { SamplesMainSlice, SamplesSlice } from '../../samples.state';
import { MatDialogRef } from '@angular/material/dialog';
import { NRLDTO, AnalysisProcedureDTO } from '../../../core/model/response.model';
import { sendSamplesSendDialogStrings } from '../../send-samples/send-samples.constants';
import { SendSamplesOpenSendDialogSSA } from '../../send-samples/state/send-samples.actions';
import { selectSendSamplesIsFileAlreadySent } from '../../send-samples/state/send-samples.selectors';
import { UpdateSampleMetaDataSOA } from '../../state/samples.actions';
import { selectNRLs } from '../../../shared/nrl/state/nrl.selectors';
import { NRLState } from '../../../shared/nrl/state/nrl.reducer';
import { SharedSlice } from '../../../shared/shared.state';
import { ShowBannerSOA } from '../../../core/state/core.actions';
import { tap } from 'rxjs/internal/operators/tap';

interface AnalysisStepViewModel {
    abbreviation: string;
    standardProcedures: string[];
    optionalProcedures: OptionalProcedure[];
}

interface OptionalProcedure {
    value: string;
    controlName: string;
}
@Component({
    selector: 'mibi-analysis-stepper',
    templateUrl: './analysis-stepper.component.html',
    styleUrls: ['./analysis-stepper.component.scss']
})
export class AnalysisStepperComponent implements OnInit, OnDestroy {

    private componentActive = true;

    warnings: string[] = [];
    showOther: { [key: string]: boolean } = {};
    showCompareHuman: { [key: string]: boolean } = {};
    analysisForm: { [key: string]: FormGroup };
    analysis: { [nrl: string]: Analysis };

    isLinear = false;

    stepperViewModel$: Observable<AnalysisStepViewModel[]>;

    constructor(
        private dialogRef: MatDialogRef<AnalysisStepperComponent>,
        private store$: Store<SamplesMainSlice & SamplesSlice<SendSamplesState>>,
        private fb: FormBuilder
    ) { }

    ngOnDestroy(): void {
        this.componentActive = false;
    }

    ngOnInit() {
        this.stepperViewModel$ = this.store$.pipe(
            tap(state => {
                if (selectSendSamplesIsFileAlreadySent(state)) {
                    this.warnings.push(
                        sendSamplesSendDialogStrings.warningAlreadySendPre
                        + selectImportedFileName(state)
                        + sendSamplesSendDialogStrings.warningAlreadySendPost
                    );
                }
            }),
            select(createSelector<SamplesMainSlice | SharedSlice<NRLState> | SamplesSlice<SendSamplesState>,
                Sample[], NRLDTO[],
                { samples: Sample[], nrls: NRLDTO[]}>(
                selectFormData,
                selectNRLs,
                (
                    samples: Sample[],
                    nrls: NRLDTO[]) => ({ samples, nrls })
            )),
            take(1),
            map(({ samples, nrls }) => this.createViewModel(samples, _.cloneDeep(nrls)))
        );
    }

    onSend() {
        this.close();
        this.store$.dispatch(new SendSamplesOpenSendDialogSSA());
    }

    onCancel() {
        this.store$.dispatch(new ShowBannerSOA({ predefined: 'sendCancel' }));
        this.close();
    }

    onChangeShowOther(nrl: string) {
        if (!this.showOther[nrl]) {
            this.analysisForm[nrl].controls.other.setValue('');
        }
    }

    onChangeCompareHuman(nrl: string) {
        if (!this.showCompareHuman[nrl]) {
            this.analysisForm[nrl].controls.compareHuman.setValue('');
        } else {
            this.analysisForm[nrl].controls.compareHuman.setValue(this.analysisForm[nrl].controls.compareHuman.value);
        }

    }
    private mapFormValues(nrl: string, values: any): Partial<SampleMeta> {

        let urgencyEnum = Urgency.NORMAL;
        switch (values.urgency.trim().toLowerCase()) {
            case 'eilt':
                urgencyEnum = Urgency.URGENT;
                break;
            case 'normal':
            default:
                urgencyEnum = Urgency.NORMAL;
        }

        return Object.keys(values).reduce((acc: { analysis: Partial<Analysis>, urgency: Urgency}, v) => {

            const prop: keyof Analysis = this.getPropertyForAnalysisKey(v);
            if (v !== 'compareHuman' && v !== 'other' && v !== 'urgency') {
                acc.analysis[prop] = values[v];
            }

            return acc;
        }, {
            analysis: {
                other: values.other,
                compareHuman: {
                    value: values.compareHuman,
                    active: this.showCompareHuman[nrl]
                }
            },
            urgency: urgencyEnum
        } as { analysis: Partial<Analysis>, urgency: Urgency });
    }

    private close(): void {
        this.dialogRef.close();
    }

    private createViewModel(
        samples: Sample[],
        nrls: NRLDTO[]): AnalysisStepViewModel[] {

        const assignedNRLs: NRLDTO[] = this.determineAssignedNRLs(samples, nrls);

        const vm = this.determineAnalysisProcedures(assignedNRLs);
        this.analysisForm = this.createFormControls(vm, samples);
        return vm;

    }

    private determineAssignedNRLs(samples: Sample[],
        nrls: NRLDTO[]) {
        // Type assertion required because typescripts static analysis can't track the filter
        return Object.keys(_.groupBy(samples, s => s.sampleMeta.nrl))
            .map(assignment => _.find(nrls, { id: assignment }))
            .filter(Boolean) as NRLDTO[];
    }

    private determineAnalysisProcedures(assignedNRLs: NRLDTO[]) {
        const comparFN = (a: AnalysisProcedureDTO, b: AnalysisProcedureDTO) => a.key - b.key;

        return assignedNRLs.map(nrl => {
            return {
                abbreviation: nrl.id,
                standardProcedures: nrl ? nrl.standardProcedures.sort(comparFN).map(p => p.value) : [],
                optionalProcedures: nrl ? nrl.optionalProcedures.sort(comparFN).map(p => ({
                    value: p.value,
                    controlName: p.key.toString()
                })) : []
            };
        });
    }

    private createFormControls(analysisStepVM: AnalysisStepViewModel[], samples: Sample[]) {

        return analysisStepVM.reduce((accumulator: { [key: string]: FormGroup }, vm) => {
            const exampleSample = _.find(samples, s => s.sampleMeta.nrl === vm.abbreviation);

            this.showCompareHuman[vm.abbreviation] = exampleSample ?
                !!(exampleSample.sampleMeta.analysis.compareHuman
                    && exampleSample.sampleMeta.analysis.compareHuman.active)
                : false;

            this.showOther[vm.abbreviation] = exampleSample ? !!exampleSample.sampleMeta.analysis.other : false;

            const currentAnalysisValues: Partial<Analysis> = exampleSample ? exampleSample.sampleMeta.analysis : {};

            const currentUrgency: string = exampleSample ? exampleSample.sampleMeta.urgency.toString() : 'NORMAL';

            const controlsConfig: { [key: string]: any } = {
                other: currentAnalysisValues.other ? currentAnalysisValues.other : '',
                compareHuman: currentAnalysisValues.compareHuman ? currentAnalysisValues.compareHuman.value : '',
                urgency: currentUrgency
            };

            vm.optionalProcedures.forEach(p => {
                controlsConfig[p.controlName] = currentAnalysisValues[this.getPropertyForAnalysisKey(p.controlName)];
            });
            accumulator[vm.abbreviation] = this.fb.group(controlsConfig);
            accumulator[vm.abbreviation].valueChanges.pipe(
                takeWhile(() => this.componentActive)).subscribe(
                val => {
                    this.store$.dispatch(
                        new UpdateSampleMetaDataSOA(
                            {
                                [vm.abbreviation]: this.mapFormValues(vm.abbreviation, val)
                            })
                    );
                },
                error => { throw error; }
            );
            // put on event queue to prevent data change during change detection cycle
            setTimeout(() => {
                this.store$.dispatch(new UpdateSampleMetaDataSOA({
                    [vm.abbreviation]: this.mapFormValues(vm.abbreviation, accumulator[vm.abbreviation].value)
                }));
            });
            return accumulator;
        }, {});
    }

    private getPropertyForAnalysisKey(key: string): keyof Analysis {
        switch (key) {
            case '0':
                return 'species';
            case '1':
                return 'serological';
            case '2':
                return 'resistance';
            case '3':
                return 'vaccination';
            case '4':
                return 'molecularTyping';
            case '5':
                return 'toxin';
            case '6':
                return 'esblAmpCCarbapenemasen';
            case '7':
                return 'sample';
            default:
                return key as keyof Analysis;
        }
    }
}
