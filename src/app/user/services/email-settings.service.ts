import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { EmailNotificationSettings } from '../../core/model/email-notification-settings.model';
import { DataService } from '../../core/services/data.service';
import { TokenizedUser } from '../model/user.model';
import { userUpdateCurrentUserSOA } from '../state/user.actions';
import { selectUserCurrentUser } from '../state/user.selectors';

/**
 * Persists the user's email-notification settings and reflects the saved value
 * back into the store so the profile stays in sync. Mirrors the save path of
 * DataConsentService.
 */
@Injectable({ providedIn: 'root' })
export class EmailSettingsService {
    constructor(
        private store$: Store,
        private dataService: DataService
    ) {}

    save(settings: EmailNotificationSettings): void {
        this.store$
            .pipe(
                select(selectUserCurrentUser),
                take(1),
                filter(
                    (currentUser): currentUser is TokenizedUser => !!currentUser
                ),
                switchMap(currentUser =>
                    this.dataService
                        .saveEmailNotificationSettings(settings)
                        .pipe(
                            map(saved => ({
                                ...currentUser,
                                emailNotificationSettings: saved
                            }))
                        )
                )
            )
            .subscribe(updated => {
                this.dataService.setCurrentUser(updated);
                this.store$.dispatch(
                    userUpdateCurrentUserSOA({ user: updated })
                );
            });
    }
}
