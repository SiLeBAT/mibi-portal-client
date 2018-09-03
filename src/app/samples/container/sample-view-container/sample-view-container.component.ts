import { Component } from '@angular/core';
import { ValidationService } from '../../services/validation.service';

@Component({
    selector: 'mibi-sample-view-container',
    template: `<mibi-sample-view [isValidating]="validationService.isValidating$ | async"></mibi-sample-view>`
})
export class SampleViewContainerComponent {

    constructor(public validationService: ValidationService) { }

}
