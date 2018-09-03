import { Component, Input } from '@angular/core';

@Component({
    selector: 'mibi-user-view-layout',
    templateUrl: './user-view-layout.component.html'
})
export class UserViewLayoutComponent {
    @Input() title: string;

    constructor() { }

}
