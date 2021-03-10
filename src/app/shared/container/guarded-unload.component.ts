import { HostListener } from '@angular/core';

export abstract class GuardedUnloadComponent {

    abstract unloadGuard(): boolean;

    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: Event) {
        if (!this.unloadGuard()) {
            $event.preventDefault();
            $event.returnValue = true;
        }
    }
}
