import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { KeycloakService } from '../../services/keycloak.service';

@Component({
    selector: 'mibi-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm: UntypedFormGroup;
    @Output() login = new EventEmitter();
    constructor(public keycloak: KeycloakService) { }
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

    klogin() {
        this.keycloak.login();
    }

    klogout() {
        this.keycloak.logout();
    }
    kprofile() {
        window.open('http://localhost:8080/realms/mibi/account', '_blank');
    }
}

