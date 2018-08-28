import { Injectable } from '@angular/core';
import { SpinnerContainerComponent } from '../spinner-container/spinner-container.component';

@Injectable()
export class LoadingSpinnerService {
    private spinnerCache = new Set<SpinnerContainerComponent>();

    _register(spinner: SpinnerContainerComponent): void {
        this.spinnerCache.add(spinner);
    }

    show(spinnerName: string): void {
        this.spinnerCache.forEach(spinner => {
            if (spinner.name === spinnerName) {
                spinner.show = true;
            }
        });
    }

    hide(spinnerName: string): void {
        this.spinnerCache.forEach(spinner => {
            if (spinner.name === spinnerName) {
                spinner.show = false;
            }
        });
    }

    isShowing(spinnerName: string): boolean {
        let showing = false;
        this.spinnerCache.forEach(spinner => {
            if (spinner.name === spinnerName) {
                showing = spinner.show;
            }
        });
        return showing;
    }

    _unregister(spinnerToRemove: SpinnerContainerComponent): void {
        this.spinnerCache.forEach(spinner => {
            if (spinner === spinnerToRemove) {
                this.spinnerCache.delete(spinner);
            }
        });
    }
}
