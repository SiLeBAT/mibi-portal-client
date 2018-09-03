import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ngfModule } from 'angular-file';
import { HotTableModule } from '@handsontable/angular';

import { DataGridComponent } from './presentation/data-grid/data-grid.component';
import { DataGridContainerComponent } from './container/data-grid-container/data-grid-container.component';
import { SampleViewComponent } from './presentation/sample-view/sample-view.component';
import { SampleViewContainerComponent } from './container/sample-view-container/sample-view-container.component';
import { SharedModule } from '../shared/shared.module';
import { UploadComponent } from './presentation/upload/upload.component';
import { UploadContainerComponent } from './container/upload-container/upload-container.component';
import { UploadViewComponent } from './presentation/upload-view/upload-view.component';
import { UploadViewContainerComponent } from './container/upload-view-container/upload-view-container.component';
import { RouterModule } from '@angular/router';
import { NoSampleGuard } from './services/no-sample-guard.service';

const SAMPLES_ROUTES = [
    { path: 'upload', component: UploadViewContainerComponent },
    { path: 'samples', component: SampleViewContainerComponent, canActivate: [NoSampleGuard] }
];
@NgModule({
    imports: [
        CommonModule,
        HotTableModule.forRoot(),
        ngfModule,
        RouterModule.forChild(SAMPLES_ROUTES),
        SharedModule
    ],
    declarations: [
        DataGridComponent,
        DataGridContainerComponent,
        SampleViewComponent,
        SampleViewContainerComponent,
        UploadComponent,
        UploadContainerComponent,
        UploadViewComponent,
        UploadViewContainerComponent
    ],
    exports: []
})
export class SamplesModule { }
