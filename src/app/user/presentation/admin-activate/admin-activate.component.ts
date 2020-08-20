import { Component, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'mibi-admin-activate',
    templateUrl: './admin-activate.component.html'
})
export class AdminActivateComponent {

    @Input() adminTokenValid: boolean;
    @Input() name: string;
    @Input() appName: string = environment.appName;

}
