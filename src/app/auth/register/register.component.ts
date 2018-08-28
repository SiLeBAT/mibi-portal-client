import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { UserService } from '../services/user.service';
import { AlertService } from '../../shared/services/alert.service';
import { Institution } from '../../shared/models/institution.model';
import { User } from '../../shared/models/user.model';

export interface IHash {
    [details: string]: string;
}

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    loading = false;
    institutions: Institution[] = [];
    instituteHash: IHash = {};
    selected: string = '';
    private pwStrength: number;

    constructor(
        private userService: UserService,
        private alertService: AlertService,
        private router: Router,
        private changeRef: ChangeDetectorRef) {
        this.pwStrength = -1;
    }

    ngOnInit() {
        this.loadInstitutions();
        this.registerForm = new FormGroup({
            institution: new FormControl(null, Validators.required),
            firstName: new FormControl(null, Validators.required),
            lastName: new FormControl(null, Validators.required),
            email: new FormControl(null, [
                Validators.required,
                Validators.email
            ]),
            password1: new FormControl(null, [Validators.required, Validators.minLength(8)]),
            password2: new FormControl(null)
        }, this.passwordConfirmationValidator);
    }

    getInstitutionName(institution: Institution): string {
        let name = institution.name1;
        if (institution.name2.length > 0) {
            name = name + ', ' + institution.name2;
        }
        name = name + ', ' + institution.location;
        return name;
    }

    private loadInstitutions() {
        this.userService.getAllInstitutions()
            .subscribe((data) => {
                for (const entry of data as Array<any>) {
                    const institution = new Institution(entry);
                    this.institutions.push(institution);
                    this.instituteHash[institution.toString()] = institution._id;
                }
            }, (err: HttpErrorResponse) => {
                try {
                    const errObj = JSON.parse(err.error);
                    this.alertService.error(errObj.title);
                } catch (e) { }
            });
    }

    register() {
        if (this.registerForm.valid) {
            const user = new User(
                this.registerForm.value.email,
                this.registerForm.value.firstName,
                this.registerForm.value.lastName
            );

            const instituteName = this.registerForm.value.institution;
            user.institution = this.instituteHash[instituteName];
            if (!user.institution) {
                user.institution = instituteName;
            }

            this.userService.create(user)
                .subscribe((data: any) => {
                    this.alertService.success(data['title'], true);
                    this.router.navigate(['users/login']).catch(() => {
                        throw new Error('Unable to navigate.');
                    });
                }, (err: HttpErrorResponse) => {
                    this.alertService.error(err.error.title, false);
                });

        }
    }

    validateField(fieldName: string) {
        return this.registerForm.controls[fieldName].valid
            || this.registerForm.controls[fieldName].untouched;
    }

    validatePwStrength() {
        return (this.pwStrength >= 0 && this.pwStrength < 2);
    }

    private passwordConfirmationValidator(fg: FormGroup) {
        const pw1 = fg.controls.password1;
        const pw2 = fg.controls.password2;

        if (pw1.value !== pw2.value) {
            pw2.setErrors({ validatePasswordConfirm: true });
        } else {
            pw2.setErrors(null);
        }
        return null;
    }

    doStrengthChange(pwStrength: number) {
        this.pwStrength = pwStrength;
        this.changeRef.detectChanges();
    }
}
