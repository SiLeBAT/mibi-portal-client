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
import { selectFormData } from '../../state/samples.selectors';
import { Sample, NewAnalysis } from '../../model/sample-management.model';
import { SamplesMainSlice, SamplesSlice } from '../../samples.state';
import { MatDialogRef } from '@angular/material';
import { NRLDTO, AnalysisProcedureDTO } from '../../../core/model/response.model';
import { sendSamplesSendDialogStrings } from '../../send-samples/send-samples.constants';
import { SendSamplesOpenSendDialogSSA } from '../../send-samples/state/send-samples.actions';
import { selectSendSamplesIsFileAlreadySent } from '../../send-samples/state/send-samples.selectors';
import { UpdateSampleMetaDataSSA } from '../../state/samples.actions';
import { selectNRLs } from '../../../shared/nrl/state/nrl.selectors';
import { NRLState } from '../../../shared/nrl/state/nrl.reducer';
import { SharedSlice } from '../../../shared/shared.state';
import { DisplayBannerSOA } from '../../../core/state/core.actions';
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
    analysis: { [nrl: string]: NewAnalysis };

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
                    this.warnings.push(sendSamplesSendDialogStrings.commentAlreadySent);
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
            map(({ samples, nrls }) => this.createViewModel(samples, nrls))
        );
    }

    onSend() {
        this.close();
        this.store$.dispatch(new SendSamplesOpenSendDialogSSA());
    }

    onCancel() {
        this.store$.dispatch(new DisplayBannerSOA({ predefined: 'sendCancel' }));
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
        }
    }
    private mapFormValues(nrl: string, values: any): { analysis: NewAnalysis, urgency: Urgency } {

        let urgencyEnum = Urgency.NORMAL;
        switch (values.urgency.trim().toLowerCase()) {
            case 'eilt':
                urgencyEnum = Urgency.URGENT;
                break;
            case 'normal':
            default:
                urgencyEnum = Urgency.NORMAL;
        }
        return Object.keys(values).reduce((acc, v) => {
            switch (v) {
                case '0':
                    acc.analysis.species = values[v];
                    break;
                case '1':
                    acc.analysis.serological = values[v];
                    break;
                case '2':
                    acc.analysis.resistance = values[v];
                    break;
                case '3':
                    acc.analysis.vaccination = values[v];
                    break;
                case '4':
                    acc.analysis.molecularTyping = values[v];
                    break;
                case '5':
                    acc.analysis.toxin = values[v];
                    break;
                case '6':
                    acc.analysis.esblAmpCCarbapenemasen = values[v];
                    break;
                case '7':
                    acc.analysis.sample = values[v];
                    break;
                default:
                    break;
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
        } as { analysis: NewAnalysis, urgency: Urgency});
    }

    private close(): void {
        this.dialogRef.close();
    }

    private createViewModel(
        samples: Sample[],
        nrls: NRLDTO[]): AnalysisStepViewModel[] {

        const assignedNRLs: NRLDTO[] = this.determineAssignedNRLs(samples, nrls);

        const vm = this.determineAnalysisProcedures(assignedNRLs);
        this.analysisForm = this.createCreateFormControls(vm, samples);
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
                    controlName: '' + p.key
                })) : []
            };
        });
    }

    private createCreateFormControls(analysisStepVM: AnalysisStepViewModel[], samples: Sample[]) {

        return analysisStepVM.reduce((accumulator: { [key: string]: FormGroup }, vm) => {
            const exampleSample = _.find(samples, s => s.sampleMeta.nrl === vm.abbreviation);

            this.showCompareHuman[vm.abbreviation] = exampleSample ?
                !!(exampleSample.sampleMeta.analysis.compareHuman
                    && exampleSample.sampleMeta.analysis.compareHuman.active)
                : false;

            this.showOther[vm.abbreviation] = exampleSample ? !!exampleSample.sampleMeta.analysis.other : false;

            const currentAnalysisValues: NewAnalysis = exampleSample ? exampleSample.sampleMeta.analysis : {
            };

            const currentUrgency: string = exampleSample ? exampleSample.sampleMeta.urgency.toString() : 'NORMAL';

            const controlsConfig: { [key: string]: any } = {
                other: currentAnalysisValues.other ? currentAnalysisValues.other : '',
                compareHuman: currentAnalysisValues.compareHuman ? currentAnalysisValues.compareHuman.value : '',
                urgency: currentUrgency
            };

            vm.optionalProcedures.forEach(p => {
                controlsConfig[p.controlName] = this.getValueForAnalysisKey(p.controlName, currentAnalysisValues);
            });
            accumulator[vm.abbreviation] = this.fb.group(controlsConfig);
            accumulator[vm.abbreviation].valueChanges.pipe(
                takeWhile(() => this.componentActive)).subscribe(
                val => {
                    this.store$.dispatch(
                        new UpdateSampleMetaDataSSA(
                            {
                                [vm.abbreviation]: this.mapFormValues(vm.abbreviation, val)
                            })
                    );
                },
                error => { throw error; }
            );
            return accumulator;
        }, {});
    }

    private getValueForAnalysisKey(key: string, analysis: NewAnalysis) {
        switch (key) {
            case '0':
                return analysis.species;
            case '1':
                return analysis.serological;
            case '2':
                return analysis.resistance;
            case '3':
                return analysis.vaccination;
            case '4':
                return analysis.molecularTyping;
            case '5':
                return analysis.toxin;
            case '6':
                return analysis.esblAmpCCarbapenemasen;
            case '7':
                return analysis.sample;
            default:
                return false;
        }
    }
}
