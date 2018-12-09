import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'mibi-recovery',
    templateUrl: './recovery.component.html',
    styleUrls: ['./recovery.component.scss']
})
export class RecoveryComponent implements OnInit {
    recoveryForm: FormGroup;

    @Output() recovery = new EventEmitter();
    constructor() { }

    ngOnInit() {
        this.recoveryForm = new FormGroup({
            email: new FormControl(null, [
                Validators.required,
                Validators.email
            ])
        });
    }

    onRecovery() {
        const email = this.recoveryForm.value.email;
        this.recovery.emit(email);
        this.recoveryForm.reset();
    }
}
