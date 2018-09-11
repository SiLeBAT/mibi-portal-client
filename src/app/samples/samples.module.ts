import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { StoreModule } from '@ngrx/store';
import { ngfModule } from 'angular-file';
import { HotTableModule } from '@handsontable/angular';

import { DataGridComponent } from './presentation/data-grid/data-grid.component';
import { DataGridContainerComponent } from './container/data-grid-container/data-grid-container.component';
import { SampleViewComponent } from './presentation/sample-view/sample-view.component';
import { SharedModule } from '../shared/shared.module';
import { UploadComponent } from './presentation/upload/upload.component';
import { UploadContainerComponent } from './container/upload-container/upload-container.component';
import { UploadViewComponent } from './presentation/upload-view/upload-view.component';
import { NoSampleGuard } from './services/no-sample-guard.service';
import { reducer, STATE_SLICE_NAME } from './state/samples.reducer';
import { EffectsModule } from '@ngrx/effects';
import { SamplesEffects } from './state/samples.effects';

const SAMPLES_ROUTES = [
    { path: 'upload', component: UploadViewComponent },
    { path: 'samples', component: SampleViewComponent, canActivate: [NoSampleGuard] }
];
@NgModule({
    imports: [
        CommonModule,
        HotTableModule.forRoot(),
        ngfModule,
        RouterModule.forChild(SAMPLES_ROUTES),
        StoreModule.forFeature(STATE_SLICE_NAME, reducer),
        EffectsModule.forFeature([SamplesEffects]),
        SharedModule
    ],
    declarations: [
        DataGridComponent,
        DataGridContainerComponent,
        SampleViewComponent,
        UploadComponent,
        UploadContainerComponent,
        UploadViewComponent
    ],
    exports: []
})
export class SamplesModule { }
