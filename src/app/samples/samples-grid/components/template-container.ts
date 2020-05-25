import { ViewChild, TemplateRef } from '@angular/core';

export abstract class SamplesGridTemplateContainer<T> {
    @ViewChild('template', { static: true })
    template: TemplateRef<T>;
}
