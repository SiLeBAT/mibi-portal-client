import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
    selector: 'mibi-reset-container',
    template: `<mibi-reset
    (reset)="reset($event)"></mibi-reset>`
})
export class ResetContainerComponent implements OnInit {
    resetForm: FormGroup;
    loading = false;
    private pwStrength: number;

    constructor(
        private userService: UserService,
        private alertService: AlertService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private changeRef: ChangeDetectorRef) {
        this.pwStrength = -1;
    }

    ngOnInit() {
        this.resetForm = new FormGroup({
            password1: new FormControl(null, Validators.required),
            password2: new FormControl(null, [Validators.required, Validators.minLength(8)])
        }, this.passwordConfirmationValidator);
    }

    validateField(fieldName: string) {
        return this.resetForm.controls[fieldName].valid
            || this.resetForm.controls[fieldName].untouched;
    }

    validatePwStrength() {
        return (this.pwStrength >= 0 && this.pwStrength < 2);
    }

    doStrengthChange(pwStrength: number) {
        this.pwStrength = pwStrength;
        this.changeRef.detectChanges();
    }

    reset(password: string) {
        this.loading = true;

        const token = this.activatedRoute.snapshot.params['id'];
        this.userService.resetPassword(password, token)
            .subscribe((data: any) => {
                const message = data['title'];
                this.alertService.success(message, true);
                this.router.navigate(['users/login']).catch(() => {
                    throw new Error('Unable to navigate.');
                });
            }, (err: HttpErrorResponse) => {
                const errMsg = err['error']['title'];
                this.alertService.error(errMsg, false);
                this.loading = false;
            });
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

}
