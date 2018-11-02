import {
    Component,
    Input, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit, ViewContainerRef
} from '@angular/core';
import { Banner } from '../../model/alert.model';
import { UserActionService } from '../../services/user-action.service';

@Component({
    selector: 'mibi-banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit, AfterViewInit {

    @Input() banner: Banner;
    @ViewChild('mainAction', { read: ViewContainerRef }) mainAction: ViewContainerRef;
    constructor(private userActionService: UserActionService, private _changeDetectionRef: ChangeDetectorRef) { }

    ngOnInit(): void {
        const viewContainerRef = this.mainAction;
        viewContainerRef.clear();
        if (this.banner.auxilliaryAction) {
            this.userActionService.createComponent(viewContainerRef, this.banner.auxilliaryAction);
        }
        if (this.banner.mainAction) {
            this.userActionService.createComponent(viewContainerRef, this.banner.mainAction);
        }
        this._changeDetectionRef.detectChanges();
    }

    ngAfterViewInit(): void {

    }
}
