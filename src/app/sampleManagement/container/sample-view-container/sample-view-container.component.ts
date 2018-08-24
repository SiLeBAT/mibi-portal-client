import { Component } from '@angular/core';
import { ValidationService } from '../../services/validation.service';

@Component({
    selector: 'app-sample-view-container',
    template: `<app-sample-view [isValidating]="validationService.isValidating$ | async"></app-sample-view>`
})
export class SampleViewContainerComponent {

    constructor(public validationService: ValidationService) { }

}
