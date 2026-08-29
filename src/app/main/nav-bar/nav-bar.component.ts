import { ChangeDetectionStrategy, Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { User } from '../../user/model/user.model';
import { selectUserCurrentUser } from '../../user/state/user.selectors';
import { UserMainSlice } from '../../user/user.state';
import { navigateMSA } from '../../shared/navigate/navigate.actions';
import { AppAuthService } from '../../user/services/app-auth.service';
import { navBarTabNames } from './nav-bar.constants';
import { NavBarTab } from './nav-bar.model';
import { map } from 'rxjs/operators';
import { NavBarAvatarUser } from './components/tabs/avatar-user.model';
import { MainLinkProviderService } from '../link-provider.service';
import { UserLinkProviderService } from '../../user/link-provider.service';
import { environment } from '../../../environments/environment';
import { selectIsAlternativeWelcomePage } from '../../core/state/core.selectors';
import { CoreMainSlice } from '../../core/core.state';

@Component({
    standalone: false,
    selector: 'mibi-nav-bar',
    template: `
        <mibi-nav-bar-layout>
            <mibi-nav-bar-title-view
                mibi-nav-bar-title
                [tab]="titleTab"
            ></mibi-nav-bar-title-view>
            <mibi-nav-bar-tabs-view
                mibi-nav-bar-tabs
                [tabs]="navTabs$ | async"
            ></mibi-nav-bar-tabs-view>
            <mibi-nav-bar-login-view
                *ngIf="(avatarUser$ | async) === null"
                mibi-nav-bar-user
                [isAlternativeWelcomePage]="isAlternativeWelcomePage$ | async"
                [tab]="loginTab"
                (login)="onLogin()"
            ></mibi-nav-bar-login-view>
            <mibi-nav-bar-avatar-view
                *ngIf="(avatarUser$ | async) as user"
                mibi-nav-bar-user
                [user]="user"
                (logout)="onAvatarLogout()"
                (profile)="onAvatarProfile()"
            ></mibi-nav-bar-avatar-view>
        </mibi-nav-bar-layout>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarComponent {

    // The "Probendaten" tab was removed — the portal now lives on a single
    // page (welcome text + upload), so no center navigation tabs are shown.
    navTabs$: Observable<NavBarTab[]> = of([]);

    avatarUser$: Observable<NavBarAvatarUser | null> = this.store$.pipe(
        select(selectUserCurrentUser),
        map(currentUser => this.getAvatarUser(currentUser))
    );

    isAlternativeWelcomePage$: Observable<boolean> = this.store$.pipe(
        select(selectIsAlternativeWelcomePage)
    );

    get titleTab(): NavBarTab {
        return {
            name: environment.appName,
            link: this.mainLinks.home
        };
    }

    get loginTab(): NavBarTab {
        return {
            name: navBarTabNames.login,
            link: this.userLinks.login
        };
    }

    constructor(
        private store$: Store<UserMainSlice & CoreMainSlice>,
        private mainLinks: MainLinkProviderService,
        private userLinks: UserLinkProviderService,
        private auth: AppAuthService
    ) { }

    onLogin() {
        this.auth.login();
    }

    onAvatarLogout() {
        this.auth.logout();
    }

    onAvatarProfile() {
        this.store$.dispatch(navigateMSA({ path: this.userLinks.profile }));
    }

    private getAvatarUser(user: User | null): NavBarAvatarUser | null {
        if(user === null) {
            return null;
        }

        const name = this.getAvatarUserName(user.firstName??'', user.lastName??'');

        return {
            name: name,
            email: user.email
        };
    }

    private getAvatarUserName(firstName: string, lastName: string): string {
        if(firstName !== '' && lastName !== '') {
            return firstName + ' ' + lastName;
        }
        if(firstName !== '') {
            return firstName;
        }
        if(lastName !== '') {
            return lastName;
        }
        return '';
    }
}
