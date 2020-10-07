import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'mibi-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;

    @Output() login = new EventEmitter();

    ngOnInit() {

        this.loginForm = new FormGroup({
            email: new FormControl(null, [
                Validators.required,
                Validators.email
            ]),
            password: new FormControl(null, Validators.required)
        });
    }

    onLogin() {
        this.login.emit({
            email: this.loginForm.value.email,
            password: this.loginForm.value.password
        });
    }
}
