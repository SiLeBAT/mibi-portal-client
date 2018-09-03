import { Component, OnInit } from '@angular/core';
import { AlertService } from '../../../core/services/alert.service';

@Component({
    selector: 'mibi-alert-container',
    template: `<mibi-alert [message]="message"></mibi-alert>`
})
export class AlertContainerComponent implements OnInit {
    message: any;

    constructor(private alertService: AlertService) { }

    ngOnInit() {
        this.alertService
            .getMessage()
            .subscribe((message) => {
                this.message = message;
            });
    }

}
