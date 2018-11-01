import { Component, Input, OnInit } from '@angular/core';

import { ActionItemConfiguration, ActionItemComponent } from '../../model/action-items.model';

@Component({
    selector: 'mibi-upload-action-item',
    templateUrl: './upload-action-item.component.html',
    styleUrls: ['./upload-action-item.component.scss']
})
export class UploadActionItemComponent implements OnInit, ActionItemComponent {

    @Input() configuration: ActionItemConfiguration;
    constructor() { }

    ngOnInit(): void {

    }
}
