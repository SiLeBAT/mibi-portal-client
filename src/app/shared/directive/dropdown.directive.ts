import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
    selector: '[appDropdown]'
})
export class DropdownDirective {
    constructor(private elementRef: ElementRef,
        private renderer: Renderer2) {
    }

    @HostListener('document:click', ['$event.target'])
    onClick(targetElement: any) {
        const nativeElement = this.elementRef.nativeElement;
        const clickedInside = nativeElement.contains(targetElement);

        if (!clickedInside || nativeElement.classList.contains('open')) {
            this.renderer.removeClass(this.elementRef.nativeElement, 'open');
        } else {
            this.renderer.addClass(this.elementRef.nativeElement, 'open');
        }
    }
}
