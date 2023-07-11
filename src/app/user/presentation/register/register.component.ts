import { Component, OnInit, Output, EventEmitter, Input, ViewChild, AfterViewInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Institution } from '../../../user/model/institution.model';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { RegistrationDetails } from '../../model/user.model';
import { PasswordComponent } from '../../password/password.component';

// InstituteValidator

const instituteValidator = (control: AbstractControl): ValidationErrors | null => control.value && control.value.id ? null : { 'institutionError': true };

// Component

@Component({
    selector: 'mibi-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, AfterViewInit {
    registerForm: UntypedFormGroup;
    filteredOptions$: Observable<Institution[]>;

    @Input() institutions: Institution[];
    @Input() supportContact: string;

    @Output() register = new EventEmitter();

    @ViewChild(PasswordComponent) private passwordComponent: PasswordComponent;

    ngOnInit() {
        this.registerForm = new UntypedFormGroup({
            institution: new UntypedFormControl(null, [Validators.required, instituteValidator]),
            firstName: new UntypedFormControl(null, Validators.required),
            lastName: new UntypedFormControl(null, Validators.required),
            email: new UntypedFormControl(null, [
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
                    // eslint-disable-next-line
                    return this.filter(value);
                })
            );
    }

    private filter(value: string): Institution[] {
        try {
            const filterValue = value.toLowerCase();

            return this.institutions.filter(inst => {
                const completeName = inst.toString();
                return completeName.toLowerCase().includes(filterValue);
            });
        } catch {
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
