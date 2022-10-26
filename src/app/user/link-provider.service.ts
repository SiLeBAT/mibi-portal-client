import { Injectable } from '@angular/core';
import { userPaths, userPathsParams } from './user.paths';


@Injectable({
    providedIn: 'root'
})
export class UserLinkProviderService {
    get login(): string { return userPaths.login; }
    get register(): string { return userPaths.register; }
    get recovery(): string { return userPaths.recovery; }
    get profile(): string { return userPaths.profile; }
    get privacyPolicy(): string { return userPaths.privacyPolicy; }
    get reset(): string { return userPaths.reset; }
    get activate(): string { return userPaths.activate; }
    get adminActivate(): string { return userPaths.adminActivate; }

    get resetIdParam(): string { return userPathsParams.reset.id; }
    get activateIdParam(): string { return userPathsParams.activate.id; }
    get adminActivateIdParam(): string { return userPathsParams.adminActivate.id; }
}
