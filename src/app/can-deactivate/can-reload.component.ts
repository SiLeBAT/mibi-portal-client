import { HostListener } from "@angular/core";

export abstract class CanReloadComponent {

    abstract canReload(): boolean;

    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: any) {
        if (!this.canReload()) {
            $event.returnValue = true;
        }
    }
}
