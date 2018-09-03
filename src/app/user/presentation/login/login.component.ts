import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'mibi-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;

    @Output() login = new EventEmitter();

    @Input() isLogingIn: boolean;

    constructor() { }

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
        this.loginForm.reset();
    }

}
