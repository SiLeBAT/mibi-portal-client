import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { DataService } from '../../core/services/data.service';
import { DataConsentDialogComponent } from '../presentation/data-consent-dialog/data-consent-dialog.component';
import { WithdrawConsentDialogComponent } from '../presentation/withdraw-consent-dialog/withdraw-consent-dialog.component';
import { TokenizedUser } from '../model/user.model';
import { userUpdateCurrentUserSOA } from '../state/user.actions';
import { selectUserCurrentUser } from '../state/user.selectors';

/**
 * Drives the data-save consent popup. The decision to show the popup is taken
 * from store state (not an action) so it survives the Keycloak bootstrap, where
 * the current user is hydrated during APP_INITIALIZER — before NgRx effects
 * start listening. Works for both auth modes since both populate currentUser.
 */
@Injectable({ providedIn: 'root' })
export class DataConsentService {
    private dialogOpen = false;

    constructor(
        private dialog: MatDialog,
        private store$: Store,
        private dataService: DataService
    ) {}

    /** Call once from the always-alive root component. */
    monitor(): void {
        this.store$.pipe(select(selectUserCurrentUser)).subscribe(user => {
            if (user && !user.dataSaveViewed && !this.dialogOpen) {
                this.openDialog();
            }
        });
    }

    /** Opens the popup on demand, e.g. to change the choice from the profile. */
    openDialog(): void {
        if (this.dialogOpen) {
            return;
        }
        this.dialogOpen = true;
        this.dialog
            .open<DataConsentDialogComponent, void, boolean>(
                DataConsentDialogComponent,
                {
                    disableClose: true,
                    autoFocus: false,
                    width: '600px',
                    maxWidth: '90vw'
                }
            )
            .afterClosed()
            .subscribe(result => {
                this.dialogOpen = false;
                if (typeof result === 'boolean') {
                    this.saveConsent(result);
                }
            });
    }

    /** Re-grant consent from the profile checkbox (no confirmation needed). */
    giveConsent(): void {
        this.saveConsent(true);
    }

    /**
     * Opens the withdraw-consent confirmation. Emits true if the user confirmed
     * the withdrawal (in which case the choice is already persisted), false if
     * they backed out (or dismissed the dialog) so the caller can revert the UI.
     */
    requestWithdraw(): Observable<boolean> {
        return this.dialog
            .open<WithdrawConsentDialogComponent, void, boolean>(
                WithdrawConsentDialogComponent,
                {
                    autoFocus: false,
                    width: '600px',
                    maxWidth: '90vw'
                }
            )
            .afterClosed()
            .pipe(
                map(result => result === true),
                tap(confirmed => {
                    if (confirmed) {
                        this.saveConsent(false);
                    }
                })
            );
    }

    private saveConsent(dataSaveAgreed: boolean): void {
        this.store$
            .pipe(
                select(selectUserCurrentUser),
                take(1),
                filter(
                    (currentUser): currentUser is TokenizedUser => !!currentUser
                ),
                switchMap(currentUser =>
                    this.dataService
                        .saveDataSaveConsent(dataSaveAgreed)
                        .pipe(
                            map(dto => ({
                                ...currentUser,
                                dataSaveAgreed: dto.dataSaveAgreed,
                                dataSaveViewed: dto.dataSaveViewed
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
