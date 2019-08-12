import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PasswordComponent } from '../../password/password.component';

@Component({
    selector: 'mibi-reset',
    templateUrl: './reset.component.html',
    styleUrls: ['./reset.component.scss']
})
export class ResetComponent implements OnInit, AfterViewInit {
    resetForm: FormGroup;

    @Output() reset = new EventEmitter();

    @ViewChild(PasswordComponent) private passwordComponent: PasswordComponent;

    constructor() { }

    ngOnInit() {
        this.resetForm = new FormGroup({ });
    }

    ngAfterViewInit(): void {
        this.resetForm.addControl('password', this.passwordComponent.passwordForm);
    }

    onReset() {
        const password = this.passwordComponent.passwordControl.value;
        this.reset.emit(password);
    }
}
