import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ngfModule } from 'angular-file';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { SingleCenterCardLayoutComponent } from './presentation/single-center-card-layout/single-center-card-layout.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WallOfTextLayoutComponent } from './presentation/wall-of-text-layout/wall-of-text-layout.component';
import { UploadComponent } from './presentation/upload/upload.component';
import { UploadContainerComponent } from './container/upload-container/upload-container.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogComponent } from './presentation/dialog/dialog.component';
import { UploadActionItemComponent } from './presentation/upload-action-item/upload-action-item.component';
import { BoxLayoutComponent } from './box-layout/box-layout.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SHARED_SLICE_NAME } from './shared.state';
import { sharedReducerMap, sharedEffects } from './shared.store';
import { NewDialogComponent } from './dialog/components/dialog.component';
import { DialogViewComponent } from './dialog/components/dialog-view.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DialogWarningsViewComponent } from './dialog/components/dialog-warnings-view.component';

@NgModule({
    imports: [
        CommonModule,
        ngfModule,
        MatDialogModule,
        MatDividerModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        MatIconModule,
        MatToolbarModule,
        FormsModule,
        ReactiveFormsModule,
        StoreModule.forFeature(SHARED_SLICE_NAME, sharedReducerMap),
        EffectsModule.forFeature(sharedEffects)
    ],
    declarations: [
        DialogComponent,
        UploadComponent,
        UploadContainerComponent,
        UploadActionItemComponent,
        SingleCenterCardLayoutComponent,
        WallOfTextLayoutComponent,
        BoxLayoutComponent,
        DialogWarningsViewComponent,
        DialogViewComponent,
        NewDialogComponent
    ],
    exports: [
        DialogComponent,
        UploadActionItemComponent,
        UploadComponent,
        UploadContainerComponent,
        SingleCenterCardLayoutComponent,
        WallOfTextLayoutComponent,
        BoxLayoutComponent,
        DialogWarningsViewComponent,
        DialogViewComponent,
        NewDialogComponent
    ],
    entryComponents: [DialogComponent, NewDialogComponent]
})
export class SharedModule { }
