import { Component } from '@angular/core';
import { LoadingSpinnerService } from '../../../core/services/loading-spinner.service';

@Component({
    selector: 'mibi-login-view-container',
    template: `<mibi-login-view
    [isLoginSpinnerShowing]="isLoginSpinnerShowing()">
    </mibi-login-view>`
})
export class LoginViewContainerComponent {

    private onLoginSpinner = 'loginSpinner';

    constructor(private spinnerService: LoadingSpinnerService) { }

    isLoginSpinnerShowing() {
        return this.spinnerService.isShowing(this.onLoginSpinner);
    }

}
