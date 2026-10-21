import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ngfModule } from 'angular-file';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SHARED_SLICE_NAME } from './shared.state';
import { sharedReducerMap, sharedEffects } from './shared.store';
import { SingleCenterCardLayoutComponent } from './single-center-card-layout/single-center-card-layout.component';
import { MibiCardActionsDirective } from './single-center-card-layout/mibi-card-actions.directive';
import { WallOfTextLayoutComponent } from './wall-of-text-layout/wall-of-text-layout.component';
import { UploadComponent } from './presentation/upload/upload.component';
import { UploadContainerComponent } from './container/upload-container/upload-container.component';
import { UploadActionItemComponent } from './presentation/upload-action-item/upload-action-item.component';
import { BoxLayoutComponent } from './box-layout/box-layout.component';
import { FormFieldComponent } from './form-field/form-field.component';
import { DialogComponent } from './dialog/components/dialog.component';
import { DialogViewComponent } from './dialog/components/dialog-view.component';
import { DialogWarningsViewComponent } from './dialog/components/dialog-warnings-view.component';

/**
 * The modules every feature needs, plus the components they share.
 *
 * A feature module imports SharedModule and has the list below available in its
 * templates; it names a Material module itself only when that module is its own
 * business -- the stepper in samples, the table in orders.
 *
 * Note that `commonModules` is exported without being imported. A module only
 * has to import what *its own* templates use, which is the shorter `imports`
 * list below; re-exporting the rest costs nothing and is what spares every
 * feature from repeating it.
 *
 * BrowserAnimationsModule deliberately does not appear here. It belongs to the
 * root module alone, and AppModule has it.
 */
const commonModules = [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatToolbarModule
];

/** The components and directives this module contributes. */
const sharedDeclarations = [
    UploadComponent,
    UploadContainerComponent,
    UploadActionItemComponent,
    SingleCenterCardLayoutComponent,
    MibiCardActionsDirective,
    WallOfTextLayoutComponent,
    BoxLayoutComponent,
    FormFieldComponent,
    DialogWarningsViewComponent,
    DialogViewComponent,
    DialogComponent
];

@NgModule({
    imports: [
        // Only what the declarations above need to compile:
        // CommonModule for *ngIf/*ngFor, ngfModule for the upload components,
        // and the three Material modules the card and dialog templates use.
        CommonModule,
        ngfModule,
        MatButtonModule,
        MatCardModule,
        MatDialogModule,
        StoreModule.forFeature(SHARED_SLICE_NAME, sharedReducerMap),
        EffectsModule.forFeature(sharedEffects)
    ],
    declarations: sharedDeclarations,
    exports: [
        ...commonModules,
        ...sharedDeclarations
    ]
})
export class SharedModule { }
