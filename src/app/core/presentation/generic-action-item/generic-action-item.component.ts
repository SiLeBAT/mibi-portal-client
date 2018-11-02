import { Component, Input } from '@angular/core';

import { ActionItemConfiguration, ActionItemComponent } from '../../model/action-items.model';

@Component({
    selector: 'mibi-generic-action-item',
    templateUrl: './generic-action-item.component.html',
    styleUrls: ['./generic-action-item.component.scss']
})
export class GenericActionItemComponent implements ActionItemComponent {

    @Input() configuration: ActionItemConfiguration;
    constructor() { }
}
