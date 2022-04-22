import { HostListener, Directive } from '@angular/core';

/* eslint-disable @angular-eslint/directive-class-suffix */
@Directive()
export abstract class GuardedUnloadComponent {

    abstract unloadGuard(): boolean;

    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: any) {
        if (!this.unloadGuard()) {
            $event.returnValue = true;
        }
    }
}
