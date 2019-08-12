import { Component, OnInit } from '@angular/core';
import * as coreActions from '../../../core/state/core.actions';
import { Store } from '@ngrx/store';
import { UserActionType } from '../../../shared/model/user-action.model';
import { CoreMainSlice } from '../../../core/core.state';
@Component({
    selector: 'mibi-sample-view',
    templateUrl: './sample-view.component.html'
})
export class SampleViewComponent implements OnInit {

    constructor(
        private store: Store<CoreMainSlice>) { }

    ngOnInit(): void {
        this.store.dispatch(new coreActions.EnableActionItems(
            [
                UserActionType.SEND,
                UserActionType.VALIDATE,
                UserActionType.EXPORT,
                UserActionType.CLOSE,
                UserActionType.UPLOAD,
                UserActionType.DOWNLOAD_TEMPLATE
            ]));
    }

}
