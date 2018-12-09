import { Component, Input } from '@angular/core';

import { UserActionViewModelConfiguration, UserActionComponent } from '../../../shared/model/user-action.model';

@Component({
    selector: 'mibi-generic-action-item',
    templateUrl: './generic-action-item.component.html'
})
export class GenericActionItemComponent implements UserActionComponent {

    @Input() configuration: UserActionViewModelConfiguration;
    constructor() { }
}
