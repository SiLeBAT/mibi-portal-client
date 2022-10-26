import { Component, OnInit, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PasswordComponent } from '../../password/password.component';
import { UserLinkProviderService } from '../../link-provider.service';

@Component({
    selector: 'mibi-reset',
    templateUrl: './reset.component.html',
    styleUrls: ['./reset.component.scss']
})
export class ResetComponent implements OnInit, AfterViewInit {
    resetForm: FormGroup;

    @Output() resetPassword = new EventEmitter();

    @ViewChild(PasswordComponent) private passwordComponent: PasswordComponent;

    constructor(public userLinks: UserLinkProviderService) {}

    ngOnInit() {
        this.resetForm = new FormGroup({ });
    }

    ngAfterViewInit(): void {
        this.resetForm.addControl('password', this.passwordComponent.passwordForm);
    }

    onResetPassword() {
        const password = this.passwordComponent.passwordControl.value;
        this.resetPassword.emit(password);
    }
}
