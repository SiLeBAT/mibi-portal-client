import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
    selector: '[mibiSamplesGridAutoFocus]'
})
export class SamplesGridAutoFocusDirective implements AfterViewInit {
    constructor(private focusElement: ElementRef) { }

    ngAfterViewInit(): void {
        this.focusElement.nativeElement.focus();
    }
}
