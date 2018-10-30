import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { DropdownDirective } from './directive/dropdown.directive';
import { SingleCenterCardLayoutComponent } from './presentation/single-center-card-layout/single-center-card-layout.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WallOfTextLayoutComponent } from './presentation/wall-of-text-layout/wall-of-text-layout.component';
@NgModule({
    imports: [
        CommonModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatButtonModule
    ],
    declarations: [
        DropdownDirective,
        SingleCenterCardLayoutComponent,
        WallOfTextLayoutComponent
    ],
    exports: [
        DropdownDirective,
        SingleCenterCardLayoutComponent,
        WallOfTextLayoutComponent
    ]
})
export class SharedModule { }
