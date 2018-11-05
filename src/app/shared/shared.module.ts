import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ngfModule } from 'angular-file';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { DropdownDirective } from './directive/dropdown.directive';
import { SingleCenterCardLayoutComponent } from './presentation/single-center-card-layout/single-center-card-layout.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WallOfTextLayoutComponent } from './presentation/wall-of-text-layout/wall-of-text-layout.component';
import { UploadComponent } from './presentation/upload/upload.component';
import { UploadContainerComponent } from './container/upload-container/upload-container.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogComponent } from './presentation/dialog/dialog.component';
import { CompileDirective } from './directive/compile.directive';
import { FlexLayoutModule } from '@angular/flex-layout';

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
        FlexLayoutModule
    ],
    declarations: [
        CompileDirective,
        DialogComponent,
        UploadComponent,
        UploadContainerComponent,
        DropdownDirective,

        SingleCenterCardLayoutComponent,
        WallOfTextLayoutComponent
    ],
    exports: [
        CompileDirective,
        DialogComponent,
        DropdownDirective,
        UploadContainerComponent,
        SingleCenterCardLayoutComponent,
        WallOfTextLayoutComponent
    ],
    entryComponents: [DialogComponent]
})
export class SharedModule { }
