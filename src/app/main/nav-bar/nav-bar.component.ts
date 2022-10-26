import { ChangeDetectionStrategy, Component } from '@angular/core';
import { createSelector, select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../../user/model/user.model';
import { selectUserCurrentUser } from '../../user/state/user.selectors';
import { UserMainSlice } from '../../user/user.state';
import { navigateMSA } from '../../shared/navigate/navigate.actions';
import { userLogoutMSA } from '../../user/state/user.actions';
import { navBarTabNames } from './nav-bar.constants';
import { NavBarTab } from './nav-bar.model';
import { map } from 'rxjs/operators';
import { selectHasEntries } from '../../samples/state/samples.selectors';
import { SamplesMainSlice } from '../../samples/samples.state';
import { NavBarAvatarUser } from './components/tabs/avatar-user.model';
import { MainLinkProviderService } from '../link-provider.service';
import { UserLinkProviderService } from '../../user/link-provider.service';
import { environment } from '../../../environments/environment';
import { SamplesLinkProviderService } from '../../samples/link-provider.service';

interface NavTabsConfig {
    hasEntries: boolean;
}

const selectNavTabsConfig = createSelector<SamplesMainSlice, boolean, NavTabsConfig>(
    selectHasEntries,
    (hasEntries) => ({
        hasEntries: hasEntries
    })
);

@Component({
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
                [tab]="loginTab"
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

    navTabs$: Observable<NavBarTab[]> = this.store$.pipe(
        select(selectNavTabsConfig),
        map(config => this.getNavTabs(config))
    );

    avatarUser$: Observable<NavBarAvatarUser | null> = this.store$.pipe(
        select(selectUserCurrentUser),
        map(currentUser => this.getAvatarUser(currentUser))
    );

    get titleTab(): NavBarTab {
        return {
            name: environment.appName,
            link: this.mainLinks.home
        };
    }

    get samplesEditorTab(): NavBarTab {
        return {
            name: navBarTabNames.samples,
            link: this.samplesLinks.editor
        };
    }

    get samplesUploadTab(): NavBarTab {
        return {
            name: navBarTabNames.samples,
            link: this.samplesLinks.upload
        };
    }

    get loginTab(): NavBarTab {
        return {
            name: navBarTabNames.login,
            link: this.userLinks.login
        };
    }

    constructor(
        private store$: Store<SamplesMainSlice & UserMainSlice>,
        private samplesLinks: SamplesLinkProviderService,
        private mainLinks: MainLinkProviderService,
        private userLinks: UserLinkProviderService
    ) { }

    onAvatarLogout() {
        this.store$.dispatch(userLogoutMSA());
    }

    onAvatarProfile() {
        this.store$.dispatch(navigateMSA({ path: this.userLinks.profile }));
    }

    private getNavTabs(config: NavTabsConfig): NavBarTab[] {
        const editorOrUploadTab = config.hasEntries ? this.samplesEditorTab : this.samplesUploadTab;
        return [editorOrUploadTab];
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
