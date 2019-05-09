import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { HotTableModule } from '@handsontable/angular';
import { DataGridComponent } from './presentation/data-grid/data-grid.component';
import { DataGridContainerComponent } from './container/data-grid-container/data-grid-container.component';
import { SampleViewComponent } from './presentation/sample-view/sample-view.component';
import { SharedModule } from '../shared/shared.module';
import { UploadViewComponent } from './presentation/upload-view/upload-view.component';
import { EffectsModule } from '@ngrx/effects';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { CoreModule } from '../core/core.module';
import { MatInputModule, MatFormFieldModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SAMPLES_SLICE_NAME } from './samples.state';
import { samplesReducerMap, samplesEffects } from './samples.store';
import { NoSampleGuard } from './services/no-sample-guard.service';

const SAMPLES_ROUTES = [
    { path: 'upload', component: UploadViewComponent },
    { path: 'samples', component: SampleViewComponent, canActivate: [NoSampleGuard] }
];

@NgModule({
    imports: [
        CommonModule,
        HotTableModule.forRoot(),
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatInputModule,
        MatFormFieldModule,
        FlexLayoutModule,
        RouterModule.forChild(SAMPLES_ROUTES),
        StoreModule.forFeature(SAMPLES_SLICE_NAME, samplesReducerMap),
        EffectsModule.forFeature(samplesEffects),
        SharedModule,
        CoreModule
    ],
    declarations: [
        DataGridComponent,
        DataGridContainerComponent,
        SampleViewComponent,
        UploadViewComponent
    ],
    entryComponents: [],
    exports: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SamplesModule { }
