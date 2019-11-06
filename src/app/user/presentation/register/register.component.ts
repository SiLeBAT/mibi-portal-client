import { Component, OnInit, Output, EventEmitter, Input, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Institution } from '../../../user/model/institution.model';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { RegistrationDetails } from '../../model/user.model';
import { PasswordComponent } from '../../password/password.component';

// InstituteValidator

const instituteValidator = (control: AbstractControl): ValidationErrors | null => {
    return control.value && control.value.id ? null : { 'institutionError': true };
};

// Component

@Component({
    selector: 'mibi-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, AfterViewInit {
    registerForm: FormGroup;
    filteredOptions$: Observable<Institution[]>;

    @Input() institutions: Institution[];
    @Input() supportContact: string;

    @Output() register = new EventEmitter();

    @ViewChild(PasswordComponent, { static: false }) private passwordComponent: PasswordComponent;

    constructor() { }

    ngOnInit() {
        this.registerForm = new FormGroup({
            institution: new FormControl(null, [Validators.required, instituteValidator]),
            firstName: new FormControl(null, Validators.required),
            lastName: new FormControl(null, Validators.required),
            email: new FormControl(null, [
                Validators.required,
                Validators.email
            ])
        });

        this.filteredOptions$ = this.registerForm.controls.institution.valueChanges
                .pipe(
                    startWith(''),
                    map(value => {
                        if (!value) {
                            return this.institutions;
                        }
                        return this._filter(value);
                    })
                );
    }

    private _filter(value: string): Institution[] {
        try {
            const filterValue = value.toLowerCase();

            return this.institutions.filter(inst => {
                const completeName = inst.toString();
                return completeName.toLowerCase().includes(filterValue);
            });
        } catch (err) {
            return [];
        }
    }

    ngAfterViewInit(): void {
        this.registerForm.addControl('password', this.passwordComponent.passwordForm);
    }

    onRegister() {
        if (this.registerForm.valid) {
            const details: RegistrationDetails = {
                email: this.registerForm.value.email,
                firstName: this.registerForm.value.firstName,
                lastName: this.registerForm.value.lastName,
                instituteId: this.registerForm.value.institution.id,
                password: this.passwordComponent.passwordControl.value
            };
            this.register.emit(details);
        }
    }
}
