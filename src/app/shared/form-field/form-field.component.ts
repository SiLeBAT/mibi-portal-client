import { Component } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';

const mibiFormFieldDefaults: MatFormFieldDefaultOptions = {
    appearance: 'fill',
    color: 'accent'
};

/**
 * Wraps a `mat-form-field` and holds the customization every form field of the
 * portal shares: the default appearance and color, and the layout inside a form group.
 *
 * The `mat-form-field` itself stays in the template of the using component, so that
 * `matInput`, `mat-label`, `mat-error` and `mat-hint` keep working as usual.
 * Inputs set on the `mat-form-field` (e.g. `appearance="outline"`) override the defaults.
 */
@Component({
    standalone: false,
    selector: 'mibi-form-field',
    template: '<ng-content></ng-content>',
    styleUrls: ['./form-field.component.scss'],
    providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: mibiFormFieldDefaults }]
})
export class FormFieldComponent { }
