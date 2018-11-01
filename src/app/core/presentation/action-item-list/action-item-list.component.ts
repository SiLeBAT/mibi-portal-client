import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActionItemConfiguration, ActionItemComponent } from '../../model/action-items.model';
import { ActionItemAnchorDirective } from '../../../shared/directive/action-item-anchor.directive';
import { Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
    selector: 'mibi-action-item-list',
    templateUrl: './action-item-list.component.html',
    styleUrls: ['./action-item-list.component.scss']
})
export class ActionItemListComponent implements OnInit, OnDestroy {

    @Input() configuration$: Observable<ActionItemConfiguration[]>;
    @ViewChild(ActionItemAnchorDirective) actionItemHost: ActionItemAnchorDirective;
    private componentActive: boolean = true;
    constructor(private componentFactoryResolver: ComponentFactoryResolver, private _changeDetectionRef: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.configuration$.pipe(
            takeWhile(() => this.componentActive)).subscribe(
                (configuration: ActionItemConfiguration[]) => {
                    const viewContainerRef = this.actionItemHost.viewContainerRef;
                    viewContainerRef.clear();
                    for (let i = 0; i < configuration.length; i++) {
                        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(configuration[i].component);
                        const componentRef = viewContainerRef.createComponent(componentFactory, i);
                        (componentRef.instance as ActionItemComponent).configuration = configuration[i];
                    }
                    this._changeDetectionRef.detectChanges();
                }
            );

    }

    ngOnDestroy(): void {
        this.componentActive = false;
    }
}
