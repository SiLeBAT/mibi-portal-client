import { Component, OnInit } from '@angular/core';
import * as fromCore from '../../../core/state/core.reducer';
import * as coreActions from '../../../core/state/core.actions';
import { Store } from '@ngrx/store';
import { UserActionType } from '../../../shared/model/user-action.model';
@Component({
    selector: 'mibi-sample-view',
    templateUrl: './sample-view.component.html',
    styleUrls: ['./sample-view.component.scss']
})
export class SampleViewComponent implements OnInit {

    constructor(
        private store: Store<fromCore.State>) { }

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
