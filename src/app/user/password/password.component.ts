import { Component, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import * as zxcvbn from 'zxcvbn';

// PasswordStrengthValidator

const PasswordStrengthValidator = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
        return null;
    }

    const score = zxcvbn(control.value).score;

    return score >= 0 && score < 2 ? { 'strengthError': true } : null;
};

// PasswordConfirmationValidator

const PasswordConfirmationValidator = (formGroup: FormGroup): ValidationErrors | null => {
    const pw1 = formGroup.get('password1');
    const pw2 = formGroup.get('password2');

    if (pw1 && pw2) {
        if (pw1.value !== pw2.value) {
            pw2.setErrors({ 'confirmationError': true });
        } else {
            pw2.setErrors(null);
        }
    }

    return null;
};

// PasswordComponent

@Component({
    selector: 'mibi-password',
    templateUrl: './password.component.html',
    styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit {
    passwordForm: FormGroup;
    passwordControl: FormControl;

    constructor() { }

    ngOnInit() {
        this.passwordControl = new FormControl(null, [Validators.required, Validators.minLength(8), PasswordStrengthValidator]);

        this.passwordForm = new FormGroup({
            password1: this.passwordControl,
            password2: new FormControl(null, Validators.required)
        }, { validators: PasswordConfirmationValidator });
    }
}
