import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MomentModule } from 'ngx-moment';
import { DropdownDirective } from './directive/dropdown.directive';
import { ViewLayoutComponent } from './presentation/view-layout/view-layout.component';
import { LastChangeDisplayContainerComponent } from './container/last-change-display-container/last-change-display-container.component';
import { LastChangeDisplayComponent } from './presentation/last-change-display/last-change-display.component';

@NgModule({
    imports: [
        CommonModule,
        MomentModule
    ],
    declarations: [
        DropdownDirective,
        LastChangeDisplayContainerComponent,
        LastChangeDisplayComponent,
        ViewLayoutComponent
    ],
    exports: [
        DropdownDirective,
        LastChangeDisplayContainerComponent,
        ViewLayoutComponent
    ]
})
export class SharedModule { }
