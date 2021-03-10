import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { environment } from '../../../../environments/environment';
import { CheckAuthMSA } from '../../../user/state/user.actions';
import { selectCurrentUser } from '../../../user/state/user.selectors';
import { UserMainSlice } from '../../../user/user.state';
import { DataService } from '../../services/data.service';

@Component({
    selector: 'mibi-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {

    constructor(private dataService: DataService, private store$: Store<UserMainSlice>) {
    }

    user$ = this.store$.select(selectCurrentUser);

    appName: string = environment.appName;
    supportContact: string = environment.supportContact;
    apiData: string;

    onTest(t: number): void {
        this.store$.dispatch(new CheckAuthMSA());
    }

    onToken(token: string, userId: string) {
        this.dataService.getTestApiToken(token, userId).subscribe((data: string) => {
            this.apiData = JSON.stringify(data);
        }, (error: HttpErrorResponse) => {
            this.apiData = error.message;
        });
    }

    onApiToken(token: string) {
        this.dataService.getApiTestApiToken(token).subscribe((data: string) => {
            this.apiData = JSON.stringify(data);
        }, (error: HttpErrorResponse) => {
            this.apiData = error.message;
        });
    }

    onUserInfo() {
        this.dataService.getUserInfo().subscribe((data: any) => {
            if(data === null) {
                this.apiData = 'null'
            } else if (data.id) {
                this.apiData = data.userName;
            } else {
                this.apiData = data.error;
            }
        }, (error: HttpErrorResponse) => {
            this.apiData = error.message;
        });
    }
}
