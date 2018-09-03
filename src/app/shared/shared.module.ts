import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownDirective } from './directive/dropdown.directive';
import { GenericSpinnerComponent } from './presentation/generic-spinner/generic-spinner.component';
import { SpinnerContainerComponent } from './container/spinner-container/spinner-container.component';
import { AlertComponent } from './presentation/alert/alert.component';
import { AlertContainerComponent } from './container/alert-container/alert-container.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        DropdownDirective,
        SpinnerContainerComponent,
        GenericSpinnerComponent,
        AlertComponent,
        AlertContainerComponent
    ],
    exports: [
        DropdownDirective,
        SpinnerContainerComponent,
        GenericSpinnerComponent,
        AlertContainerComponent
    ]
})
export class SharedModule { }
