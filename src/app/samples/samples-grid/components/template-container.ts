import { ViewChild, TemplateRef, Directive } from '@angular/core';

/* eslint-disable @angular-eslint/directive-class-suffix */
@Directive()
export abstract class SamplesGridTemplateContainer<T> {
    @ViewChild('template', { static: true })
    template: TemplateRef<T>;
}
