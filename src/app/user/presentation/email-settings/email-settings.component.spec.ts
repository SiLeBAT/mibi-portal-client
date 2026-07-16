import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { EmailSettingsService } from '../../services/email-settings.service';
import { User } from '../../model/user.model';
import { EmailSettingsComponent } from './email-settings.component';

/**
 * Guards MPC-772: selecting "Wöchentlich" used to reveal the weekday choices
 * below "Monatlich" instead of directly under "Wöchentlich", because every
 * sub-option was rendered after the whole frequency group. These tests assert
 * the sub-options render in-place, immediately after their own frequency
 * option in DOM order.
 */
describe('EmailSettingsComponent', () => {
    let fixture: ComponentFixture<EmailSettingsComponent>;
    let component: EmailSettingsComponent;
    let save: jest.Mock;

    beforeEach(async () => {
        save = jest.fn();
        await TestBed.configureTestingModule({
            declarations: [EmailSettingsComponent],
            imports: [
                NoopAnimationsModule,
                MatCardModule,
                MatCheckboxModule,
                MatRadioModule
            ],
            providers: [
                { provide: EmailSettingsService, useValue: { save: save } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(EmailSettingsComponent);
        component = fixture.componentInstance;
        component.currentUser = {} as User;
        fixture.detectChanges();
    });

    /** Every radio button in document order. */
    function radioButtons(): HTMLElement[] {
        return fixture.debugElement
            .queryAll(By.css('mat-radio-button'))
            .map(debugEl => debugEl.nativeElement as HTMLElement);
    }

    /** Trimmed text of every radio button in document order. */
    function radioLabels(): string[] {
        return radioButtons().map(el => el.textContent?.trim() ?? '');
    }

    function enable(): void {
        component.settings = { ...component.settings, enabled: true };
        fixture.detectChanges();
    }

    it('hides the frequency options until the checkbox is ticked', () => {
        expect(radioLabels()).toEqual([]);
    });

    it('shows only the three frequencies for the default (daily) choice', () => {
        enable();
        expect(radioLabels()).toEqual(['Täglich', 'Wöchentlich', 'Monatlich']);
    });

    it('renders the weekday choices directly under "Wöchentlich"', () => {
        enable();
        component.settings = { ...component.settings, frequency: 'weekly' };
        fixture.detectChanges();

        expect(radioLabels()).toEqual([
            'Täglich',
            'Wöchentlich',
            'Montag',
            'Dienstag',
            'Mittwoch',
            'Donnerstag',
            'Freitag',
            'Monatlich'
        ]);
    });

    it('renders the week-of-month and weekday choices under "Monatlich"', () => {
        enable();
        component.settings = { ...component.settings, frequency: 'monthly' };
        fixture.detectChanges();

        expect(radioLabels()).toEqual([
            'Täglich',
            'Wöchentlich',
            'Monatlich',
            '1.',
            '2.',
            '3.',
            '4.',
            'letzter',
            'Montag',
            'Dienstag',
            'Mittwoch',
            'Donnerstag',
            'Freitag'
        ]);
    });

    it('keeps the frequency selection when a weekday is picked', () => {
        enable();
        component.settings = { ...component.settings, frequency: 'weekly' };
        fixture.detectChanges();

        const dienstag = radioButtons().find(
            el => el.textContent?.trim() === 'Dienstag'
        ) as HTMLElement;
        (dienstag.querySelector('input') as HTMLInputElement).click();
        fixture.detectChanges();

        expect(component.settings.frequency).toBe('weekly');
        expect(component.settings.weekday).toBe('tuesday');
        expect(save).toHaveBeenCalled();
    });
});
