import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../shared/shared.module';
import { UploadViewComponent } from './presentation/upload-view/upload-view.component';
import { EffectsModule } from '@ngrx/effects';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
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
import { SamplesEditorComponent } from './samples-editor/samples-editor.component';
import { GridModule } from '../grid/grid.module';
import { samplesPathsSegments } from './samples.paths';
import { NoSampleGuard } from './services/no-sample-guard.service';
import { AnimationsRouteData } from '../shared/animations/animations.model';
import { ExcelVersionDialogComponent } from './import-samples/components/excel-version-dialog.component';
import { OrdersModule } from '../orders/orders.module';

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
        MatMenuModule,
        MatInputModule,
        MatStepperModule,
        MatRadioModule,
        MatCheckboxModule,
        MatFormFieldModule,
        RouterModule.forChild(routes),
        StoreModule.forFeature(SAMPLES_SLICE_NAME, samplesReducerMap),
        EffectsModule.forFeature(samplesEffects),
        SharedModule,
        CoreModule,
        GridModule,
        OrdersModule
    ],
    declarations: [
        UploadViewComponent,
        SendDialogViewComponent,
        SendDialogComponent,
        AnalysisStepperComponent,
        SamplesEditorComponent,
        ExcelVersionDialogComponent
    ],
    exports: []
})
export class SamplesModule { }
