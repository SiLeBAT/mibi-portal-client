import { Component, Input } from '@angular/core';

@Component({
    selector: 'mibi-activate',
    templateUrl: './activate.component.html'
})
export class ActivateComponent {
    @Input() tokenValid: boolean;
    @Input() appName: string;

}
