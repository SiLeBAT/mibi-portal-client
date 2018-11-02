import { Component, Inject, OnInit, ViewChild, ViewContainerRef, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogContent } from '../../../core/model/dialog.model';
import { UserActionService } from '../../../core/services/user-action.service';

@Component({
    selector: 'mibi-dialog',
    templateUrl: './dialog.component.html'
})
export class DialogComponent implements OnInit {

    @ViewChild('mainAction', { read: ViewContainerRef }) mainAction: ViewContainerRef;
    @ViewChild('mainActionTemplate') mainActionTemplate: TemplateRef<any>;
    constructor(
        public dialogRef: MatDialogRef<DialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogContent,
        private _changeDetectionRef: ChangeDetectorRef,
        private userActionService: UserActionService) { }

    closeDialog(): void {
        this.dialogRef.close();
    }

    ngOnInit(): void {
        const viewContainerRef = this.mainAction;
        viewContainerRef.clear();
        if (this.data.auxilliaryAction) {
            this.userActionService.augmentOnClick(this.data.auxilliaryAction, this.closeDialog.bind(this));
            this.userActionService.createComponent(viewContainerRef, this.data.auxilliaryAction);
        }
        if (this.data.mainAction) {
            this.data.mainAction.template = this.mainActionTemplate;
            this.userActionService.augmentOnClick(this.data.mainAction, this.closeDialog.bind(this));
            this.userActionService.createComponent(viewContainerRef, this.data.mainAction);
        }
        this._changeDetectionRef.detectChanges();
    }

}
