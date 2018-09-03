import { Component, Input } from '@angular/core';

@Component({
    selector: 'mibi-login-view',
    templateUrl: './login-view.component.html'
})
export class LoginViewComponent {
    @Input() isLoginSpinnerShowing: boolean;

    constructor() { }

}
