import {
    Component,
    Input, OnInit, ViewChild, ComponentFactoryResolver, ChangeDetectorRef, AfterViewInit, ViewContainerRef
} from '@angular/core';
import { Banner } from '../../model/alert.model';
import { ActionItemComponent, ActionItemConfiguration } from '../../model/action-items.model';

@Component({
    selector: 'mibi-banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit, AfterViewInit {

    @Input() banner: Banner;
    @ViewChild('mainAction', { read: ViewContainerRef }) mainAction: ViewContainerRef;
    constructor(private componentFactoryResolver: ComponentFactoryResolver, private _changeDetectionRef: ChangeDetectorRef) { }

    ngOnInit(): void {
        const viewContainerRef = this.mainAction;
        viewContainerRef.clear();
        if (this.banner.auxilliaryButton) {
            this.createComponent(viewContainerRef, this.banner.auxilliaryButton);
        }
        if (this.banner.mainButton) {
            this.createComponent(viewContainerRef, this.banner.mainButton);
        }
        this._changeDetectionRef.detectChanges();
    }

    ngAfterViewInit(): void {

    }

    private createComponent(ref: ViewContainerRef, configuration: ActionItemConfiguration) {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(configuration.component);
        const componentRef = ref.createComponent(componentFactory);
        (componentRef.instance as ActionItemComponent).configuration = configuration;
    }
}
