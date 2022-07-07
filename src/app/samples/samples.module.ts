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
import { DataGridViewComponent } from './data-grid/components/grid-view.component';
import { SamplesGridDataEditorTemplateComponent } from './samples-grid/components/editors/data-editor-template.component';
import { SamplesGridViewComponent } from './samples-grid/components/samples-grid-view.component';
import { SamplesGridTextCellTemplateComponent } from './samples-grid/components/cells/text-cell-template.component';
import { SamplesGridDataCellTemplateComponent } from './samples-grid/components/cells/data-cell-template.component';
import { DataGridCellViewComponent } from './data-grid/components/cell-view.component';
import { SamplesGridAutoFocusDirective } from './samples-grid/components/editors/auto-focus.directive';
import { SamplesEditorComponent } from './samples-editor.component';
import { DataGridEditorViewComponent } from './data-grid/components/editor-view.component';
import { DataGridDirtyEmitterDirective } from './data-grid/components/dirty-emitter.directive';
import { SamplesGridListBoxViewComponent } from './samples-grid/components/editors/list-box-view.component';
import { SamplesGridDataEditorViewComponent } from './samples-grid/components/editors/data-editor-view.component';
import { SamplesGridToolTipDirective } from './samples-grid/components/cells/tool-tip.directive';
import { SamplesViewerComponent } from './samples-viewer.component';
import { samplesPathsSegments } from './samples.paths';
import { NoSampleGuard } from './services/no-sample-guard.service';
import { AuthGuard } from '../user/services/auth-guard.service';
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
            { path: samplesPathsSegments.viewer, component: SamplesViewerComponent, canActivate: [AuthGuard] }
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
        SamplesEditorComponent,
        SamplesViewerComponent
    ],
    exports: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SamplesModule { }
