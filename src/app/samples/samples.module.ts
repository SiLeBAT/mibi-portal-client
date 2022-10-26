import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../shared/shared.module';
import { UploadViewComponent } from './presentation/upload-view/upload-view.component';
import { EffectsModule } from '@ngrx/effects';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { CoreModule } from '../core/core.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { SAMPLES_SLICE_NAME } from './samples.state';
import { samplesReducerMap, samplesEffects } from './samples.store';
import { SendDialogComponent } from './send-samples/components/send-dialog.component';
import { SendDialogViewComponent } from './send-samples/components/send-dialog-view.component';
import { AnalysisStepperComponent } from './send-samples/components/analysis-stepper.component';
import { DataGridViewComponent } from './data-grid/data-grid-view.component';
import { SamplesGridDataEditorTemplateComponent } from './samples-grid/internal/editors/data-editor-template.component';
import { SamplesGridViewComponent } from './samples-grid/samples-grid-view.component';
import { SamplesGridTextCellTemplateComponent } from './samples-grid/internal/cells/text-cell-template.component';
import { SamplesGridDataCellTemplateComponent } from './samples-grid/internal/cells/data-cell-template.component';
import { DataGridCellViewComponent } from './data-grid/internal/components/cell-view.component';
import { SamplesGridAutoFocusDirective } from './samples-grid/internal/editors/auto-focus.directive';
import { SamplesEditorComponent } from './samples-editor/samples-editor.component';
import { DataGridEditorViewComponent } from './data-grid/internal/components/editor-view.component';
import { DataGridDirtyEmitterDirective } from './data-grid/internal/components/dirty-emitter.directive';
import { SamplesGridListBoxViewComponent } from './samples-grid/internal/editors/list-box-view.component';
import { SamplesGridDataEditorViewComponent } from './samples-grid/internal/editors/data-editor-view.component';
import { SamplesGridToolTipDirective } from './samples-grid/internal/cells/tool-tip.directive';
import { samplesPathsSegments } from './samples.paths';
import { NoSampleGuard } from './services/no-sample-guard.service';
import { AnimationsRouteData } from '../shared/animations/animations.model';

const disabledTransitionAnimationData: AnimationsRouteData = {
    transitionAnimation: 'disabled'
};

const routes: Routes = [
    {
        path: samplesPathsSegments.samples,
        children: [
            { path: samplesPathsSegments.upload, component: UploadViewComponent },
            {
                path: samplesPathsSegments.editor,
                component: SamplesEditorComponent,
                canActivate: [NoSampleGuard],
                data: { ...disabledTransitionAnimationData }
            },
            { path: '**', redirectTo: samplesPathsSegments.editor }
        ]
    }
];

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatInputModule,
        MatStepperModule,
        MatRadioModule,
        MatCheckboxModule,
        MatFormFieldModule,
        RouterModule.forChild(routes),
        StoreModule.forFeature(SAMPLES_SLICE_NAME, samplesReducerMap),
        EffectsModule.forFeature(samplesEffects),
        SharedModule,
        CoreModule
    ],
    declarations: [
        UploadViewComponent,
        SendDialogViewComponent,
        SendDialogComponent,
        AnalysisStepperComponent,
        DataGridDirtyEmitterDirective,
        DataGridCellViewComponent,
        DataGridEditorViewComponent,
        DataGridViewComponent,
        SamplesGridAutoFocusDirective,
        SamplesGridToolTipDirective,
        SamplesGridTextCellTemplateComponent,
        SamplesGridDataCellTemplateComponent,
        SamplesGridDataEditorTemplateComponent,
        SamplesGridListBoxViewComponent,
        SamplesGridDataEditorViewComponent,
        SamplesGridViewComponent,
        SamplesEditorComponent
    ],
    exports: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SamplesModule { }
