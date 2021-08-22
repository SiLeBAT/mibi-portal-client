import { ViewChild, TemplateRef, Directive } from '@angular/core';

/* tslint:disable:directive-class-suffix */
@Directive()
export abstract class SamplesGridTemplateContainer<T> {
    @ViewChild('template', { static: true })
    template: TemplateRef<T>;
}
