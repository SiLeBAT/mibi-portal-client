import { Urgency } from '../../model/sample.enums';
import _ from 'lodash';
import { Observable } from 'rxjs';
import { SendSamplesState } from '../state/send-samples.reducer';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select, createSelector } from '@ngrx/store';
import { selectSampleData } from '../../state/samples.selectors';
import { Sample, Analysis, SampleMeta } from '../../model/sample-management.model';
import { SamplesMainSlice, SamplesSlice } from '../../samples.state';
import { MatDialogRef } from '@angular/material/dialog';
import { NRLDTO, AnalysisProcedureDTO } from '../../../core/model/response.model';
import { sendSamplesConfirmAnalysisSSA, sendSamplesCancelAnalysisSSA } from '../state/send-samples.actions';
import { selectSendSamplesDialogWarnings } from '../state/send-samples.selectors';
import { samplesUpdateSampleMetaDataSOA } from '../../state/samples.actions';
import { selectNrls } from '../../../shared/nrl/state/nrl.selectors';
import { NrlState } from '../../../shared/nrl/state/nrl.reducer';
import { SharedSlice } from '../../../shared/shared.state';
import { DialogWarning } from '../../../shared/dialog/dialog.model';
import { map, take, takeWhile } from 'rxjs/operators';

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

    warnings$: Observable<DialogWarning[]> = this.store$.select(selectSendSamplesDialogWarnings);
    showOther: Record<string, boolean> = {};
    showCompareHuman: Record<string, boolean> = {};
    analysisForm: Record<string, UntypedFormGroup>;
    analysis: Record<string, Analysis>;

    isLinear = false;

    stepperViewModel$: Observable<AnalysisStepViewModel[]>;

    constructor(
        private dialogRef: MatDialogRef<AnalysisStepperComponent>,
        private store$: Store<SamplesMainSlice & SamplesSlice<SendSamplesState>>,
        private fb: UntypedFormBuilder
    ) { }

    ngOnDestroy(): void {
        this.componentActive = false;
    }

    ngOnInit() {
        this.stepperViewModel$ = this.store$.pipe(
            select(
                // eslint-disable-next-line
                createSelector<SamplesMainSlice | SharedSlice<NrlState> | SamplesSlice<SendSamplesState>,[Sample[], NRLDTO[]], { samples: Sample[]; nrls: NRLDTO[] }>(
                    selectSampleData,
                    selectNrls,
                    (
                        samples: Sample[],
                        nrls: NRLDTO[]) => ({ samples: samples, nrls: nrls })
                )),
            take(1),
            map(({ samples, nrls }) => this.createViewModel(samples, _.cloneDeep(nrls)))
        );
    }

    onSend() {
        this.close();
        this.store$.dispatch(sendSamplesConfirmAnalysisSSA());
    }

    onCancel() {
        this.close();
        this.store$.dispatch(sendSamplesCancelAnalysisSSA());
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

        // eslint-disable-next-line
        return Object.keys(values).reduce((acc: { analysis: Partial<Analysis>; urgency: Urgency }, v) => {

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
        });
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

        return assignedNRLs.map(nrl => ({
            abbreviation: nrl.id,
            standardProcedures: nrl ? nrl.standardProcedures.sort(comparFN).map(p => p.value) : [],
            optionalProcedures: nrl ? nrl.optionalProcedures.sort(comparFN).map(p => ({
                value: p.value,
                controlName: p.key.toString()
            })) : []
        }));
    }

    private createFormControls(analysisStepVM: AnalysisStepViewModel[], samples: Sample[]) {
        // eslint-disable-next-line unicorn/no-array-reduce, unicorn/prefer-object-from-entries
        return analysisStepVM.reduce((accumulator: Record<string, UntypedFormGroup>, vm) => {
            const exampleSample = _.find(samples, s => s.sampleMeta.nrl === vm.abbreviation);

            this.showCompareHuman[vm.abbreviation] = exampleSample ?
                !!(exampleSample.sampleMeta.analysis.compareHuman
                    && exampleSample.sampleMeta.analysis.compareHuman.active)
                : false;

            this.showOther[vm.abbreviation] = exampleSample ? !!exampleSample.sampleMeta.analysis.other : false;

            const currentAnalysisValues: Partial<Analysis> = exampleSample ? exampleSample.sampleMeta.analysis : {};

            const currentUrgency: string = exampleSample ? exampleSample.sampleMeta.urgency.toString() : 'NORMAL';

            const controlsConfig: Record<string, any> = {
                other: currentAnalysisValues.other ? currentAnalysisValues.other : '',
                compareHuman: currentAnalysisValues.compareHuman ? currentAnalysisValues.compareHuman.value : '',
                urgency: currentUrgency
            };

            vm.optionalProcedures.forEach(p => {
                controlsConfig[p.controlName] = currentAnalysisValues[this.getPropertyForAnalysisKey(p.controlName)];
            });
            accumulator[vm.abbreviation] = this.fb.group(controlsConfig);
            accumulator[vm.abbreviation].valueChanges
                .pipe(takeWhile(() => this.componentActive))
                .subscribe(val => {
                    this.store$.dispatch(
                        samplesUpdateSampleMetaDataSOA({
                            metaData: {
                                [vm.abbreviation]: this.mapFormValues(vm.abbreviation, val)
                            }
                        })
                    );
                }, (error) => { throw error; });
            // put on event queue to prevent data change during change detection cycle
            setTimeout(() => {
                this.store$.dispatch(
                    samplesUpdateSampleMetaDataSOA({
                        metaData: {
                            [vm.abbreviation]: this.mapFormValues(vm.abbreviation, accumulator[vm.abbreviation].value)
                        }
                    })
                );
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
