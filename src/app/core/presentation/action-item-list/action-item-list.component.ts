import {
    Component,
    Input, OnInit, ViewChild, OnDestroy, TemplateRef, ViewContainerRef
} from '@angular/core';
import { UserActionViewModelConfiguration, UserActionType } from '../../../shared/model/user-action.model';
import { Observable } from 'rxjs';
import { takeWhile, startWith, tap, delay } from 'rxjs/operators';
import { UserActionService } from '../../services/user-action.service';

@Component({
    selector: 'mibi-action-item-list',
    templateUrl: './action-item-list.component.html',
    styleUrls: ['./action-item-list.component.scss']
})
export class ActionItemListComponent implements OnInit, OnDestroy {

    @Input() configuration$: Observable<UserActionViewModelConfiguration[]>;
    @ViewChild('actionList', { read: ViewContainerRef }) actionItemHost: ViewContainerRef;
    @ViewChild('customActionItems')
    private customActionItems: TemplateRef<any>;
    @ViewChild('uploadActionItem')
    private uploadActionItem: TemplateRef<any>;
    private componentActive: boolean = true;
    hasElements: boolean = false;
    constructor(private userActionService: UserActionService) { }

    ngOnInit(): void {
        this.configuration$.pipe(
            startWith([]),
            delay(0),
            takeWhile(() => this.componentActive),
            tap((configuration: UserActionViewModelConfiguration[]) => {
                this.hasElements = !!configuration.length;
                if (this.hasElements) {
                    this.createComponents(configuration);
                }
            }
            )).subscribe();
    }

    ngOnDestroy(): void {
        this.componentActive = false;
    }

    private createComponents(configuration: UserActionViewModelConfiguration[]) {
        const viewContainerRef = this.actionItemHost;
        viewContainerRef.clear();
        for (let i = 0; i < configuration.length; i++) {
            const myConfig = { ...configuration[i] };
            myConfig.template = this.getTemplate(myConfig.type);
            this.userActionService.createComponent(viewContainerRef, myConfig);
        }
    }

    private getTemplate(type: UserActionType): TemplateRef<any> {
        switch (type) {
            case UserActionType.UPLOAD:
                return this.uploadActionItem;
            default:
                return this.customActionItems;
        }
    }
}
