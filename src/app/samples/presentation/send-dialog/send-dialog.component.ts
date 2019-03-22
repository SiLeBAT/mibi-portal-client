import { Component, OnInit, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { DisplayBanner } from '../../../core/state/core.actions';
import { SendSamplesConfirmed } from '../../state/samples.actions';
import { MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from '../../../core/model/dialog.model';
import { SendDialogConfiguration } from '../../model/send-dialog.model';
import { FormControl } from '@angular/forms';
import { State } from '../../../state/app.state';

@Component({
    selector: 'mibi-send-dialog',
    templateUrl: './send-dialog.component.html'
})
export class SendDialogComponent implements OnInit {
    config: SendDialogConfiguration;

    commentControl = new FormControl('');

    constructor(@Inject(MAT_DIALOG_DATA) private data: DialogData<SendDialogConfiguration>,
  private store: Store<State>) { }

    ngOnInit() {
        this.config = this.data.configuration;
    }

    onConfirm() {
        this.store.dispatch(new SendSamplesConfirmed(this.commentControl.value));
    }

    onCancel() {
        this.store.dispatch(new DisplayBanner({ predefined: 'sendCancel' }));
    }
}
