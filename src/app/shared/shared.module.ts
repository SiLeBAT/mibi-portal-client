import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownDirective } from './directive/dropdown.directive';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        DropdownDirective
    ],
    exports: [
        DropdownDirective
    ]
})
export class SharedModule { }
