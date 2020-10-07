import { Directive, Input, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DataGridDirtyEmitter } from '../domain/cell-controller.model';
import { tap } from 'rxjs/operators';

@Directive({
    selector: '[mibiDataGridDirtyEmitter]'
})
export class DataGridDirtyEmitterDirective implements OnInit, OnDestroy {

    @Input('mibiDataGridDirtyEmitter') dirtyEmitter: Observable<DataGridDirtyEmitter>;

    private dirtyEmitterSubscription: Subscription;

    constructor(private readonly changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.dirtyEmitterSubscription = this.dirtyEmitter.pipe(tap(() => {
            this.changeDetectorRef.detectChanges();
        })).subscribe();
    }

    ngOnDestroy(): void {
        this.dirtyEmitterSubscription.unsubscribe();
    }
}
