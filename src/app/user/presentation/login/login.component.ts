import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Credentials } from '../../model/user.model';

@Component({
    standalone: false,
    selector: 'mibi-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    // Keycloak mode renders a single SSO button (emits undefined); legacy mode
    // renders the credential form (emits Credentials).
    @Input() keycloakEnabled = false;

    @Output() login = new EventEmitter<Credentials | undefined>();

    loginForm!: UntypedFormGroup;

    ngOnInit() {
        this.loginForm = new UntypedFormGroup({
            email: new UntypedFormControl(null, [
                Validators.required,
                Validators.email
            ]),
            password: new UntypedFormControl(null, Validators.required)
        });
    }

    onLoginLegacy() {
        this.login.emit({
            email: this.loginForm.value.email,
            password: this.loginForm.value.password
        });
    }

    onLoginKeycloak() {
        this.login.emit();
    }
}
