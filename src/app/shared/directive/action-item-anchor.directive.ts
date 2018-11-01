import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[mibi-action-item-host]'
})
export class ActionItemAnchorDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}
