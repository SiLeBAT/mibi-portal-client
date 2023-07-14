import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';

@Component({
    selector: 'mibi-recovery',
    templateUrl: './recovery.component.html',
    styleUrls: ['./recovery.component.scss']
})
export class RecoveryComponent implements OnInit {
    recoveryForm: UntypedFormGroup;

    @Output() recovery = new EventEmitter();

    ngOnInit() {
        this.recoveryForm = new UntypedFormGroup({
            email: new UntypedFormControl(null, [
                Validators.required,
                Validators.email
            ])
        });
    }

    onRecovery() {
        const email = this.recoveryForm.value.email;
        this.recovery.emit(email);
    }
}
