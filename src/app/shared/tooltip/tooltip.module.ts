import { NgModule } from '@angular/core';
import { ToolTipDirective } from './tooltip.directive';

/**
 * Tooltips, and the whole of the application's contact with tooltipster.
 *
 * A module of its own rather than part of SharedModule: the grid needs
 * tooltips without taking on everything else SharedModule brings with it.
 */
@NgModule({
    declarations: [
        ToolTipDirective
    ],
    exports: [
        ToolTipDirective
    ]
})
export class ToolTipModule { }
