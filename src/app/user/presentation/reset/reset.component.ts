import { Component, OnInit, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { PasswordComponent } from '../../password/password.component';

@Component({
    selector: 'mibi-reset',
    templateUrl: './reset.component.html',
    styleUrls: ['./reset.component.scss']
})
export class ResetComponent implements OnInit, AfterViewInit {
    resetForm: UntypedFormGroup;

    @Output() resetPassword = new EventEmitter();

    @ViewChild(PasswordComponent) private passwordComponent: PasswordComponent;

    ngOnInit() {
        this.resetForm = new UntypedFormGroup({ });
    }

    ngAfterViewInit(): void {
        this.resetForm.addControl('password', this.passwordComponent.passwordForm);
    }

    onResetPassword() {
        const password = this.passwordComponent.passwordControl.value;
        this.resetPassword.emit(password);
    }
}
