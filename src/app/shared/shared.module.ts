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
import { CompileDirective } from './directive/compile.directive';
import { UploadActionItemComponent } from './presentation/upload-action-item/upload-action-item.component';
import { LayoutBoxComponent } from './presentation/layout-box/layout-box.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SHARED_SLICE_NAME } from './shared.state';
import { sharedReducerMap, sharedEffects } from './shared.store';
import { NewDialogComponent } from './dialog/components/dialog.component';
import { DialogViewComponent } from './dialog/components/dialog-view.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule, MatMenuModule, MatIconModule, MatToolbarModule } from '@angular/material';

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
        CompileDirective,
        DialogComponent,
        UploadComponent,
        UploadContainerComponent,
        UploadActionItemComponent,
        SingleCenterCardLayoutComponent,
        WallOfTextLayoutComponent,
        LayoutBoxComponent,
        DialogViewComponent,
        NewDialogComponent
    ],
    exports: [
        CompileDirective,
        DialogComponent,
        UploadActionItemComponent,
        UploadComponent,
        UploadContainerComponent,
        SingleCenterCardLayoutComponent,
        WallOfTextLayoutComponent,
        LayoutBoxComponent,
        DialogViewComponent,
        NewDialogComponent
    ],
    entryComponents: [DialogComponent, NewDialogComponent]
})
export class SharedModule { }
