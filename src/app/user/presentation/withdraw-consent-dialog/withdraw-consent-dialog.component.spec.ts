import { MatDialogRef } from '@angular/material/dialog';
import { userConsentWithdrawStrings } from '../../user-consent.constants';
import { WithdrawConsentDialogComponent } from './withdraw-consent-dialog.component';

describe('WithdrawConsentDialogComponent', () => {
    let dialogRef: { close: jest.Mock };
    let component: WithdrawConsentDialogComponent;

    beforeEach(() => {
        dialogRef = { close: jest.fn() };
        component = new WithdrawConsentDialogComponent(
            dialogRef as unknown as MatDialogRef<
                WithdrawConsentDialogComponent,
                boolean
            >
        );
    });

    it('starts in the initial stage with a non-highlighted, enabled withdraw button', () => {
        expect(component.confirming).toBe(false);
        expect(component.withdrawHighlighted).toBe(false);
        expect(component.withdrawDisabled).toBe(false);
    });

    it('onBack closes the dialog with false (keeps consent)', () => {
        component.onBack();
        expect(dialogRef.close).toHaveBeenCalledWith(false);
    });

    it('first withdraw click reveals the confirmation stage without withdrawing', () => {
        component.onWithdraw();

        expect(component.confirming).toBe(true);
        expect(dialogRef.close).not.toHaveBeenCalled();
        // The button deactivates until "delete" is typed.
        expect(component.withdrawDisabled).toBe(true);
        expect(component.withdrawHighlighted).toBe(false);
    });

    it('stays disabled and does not close for anything other than exactly "delete"', () => {
        component.onWithdraw(); // enter confirmation stage

        component.confirmControl.setValue('delet');
        expect(component.confirmed).toBe(false);
        expect(component.withdrawDisabled).toBe(true);
        component.onWithdraw();
        expect(dialogRef.close).not.toHaveBeenCalled();

        // Case-sensitive: "Delete" must not arm the button.
        component.confirmControl.setValue('Delete');
        expect(component.confirmed).toBe(false);
        expect(component.withdrawDisabled).toBe(true);
    });

    it('arms and highlights the withdraw button once exactly "delete" is typed', () => {
        component.onWithdraw(); // enter confirmation stage
        component.confirmControl.setValue(
            userConsentWithdrawStrings.confirmToken
        );

        expect(component.confirmed).toBe(true);
        expect(component.withdrawHighlighted).toBe(true);
        expect(component.withdrawDisabled).toBe(false);
    });

    it('withdraw click closes with true once "delete" is typed', () => {
        component.onWithdraw(); // enter confirmation stage
        component.confirmControl.setValue('delete');

        component.onWithdraw();

        expect(dialogRef.close).toHaveBeenCalledWith(true);
    });
});
