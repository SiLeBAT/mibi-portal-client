import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';

@Component({
    selector: 'mibi-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm: UntypedFormGroup;

    @Output() login = new EventEmitter();

    ngOnInit() {

        this.loginForm = new UntypedFormGroup({
            email: new UntypedFormControl(null, [
                Validators.required,
                Validators.email
            ]),
            password: new UntypedFormControl(null, Validators.required)
        });
    }

    onLogin() {
        this.login.emit({
            email: this.loginForm.value.email,
            password: this.loginForm.value.password
        });
    }
}
