import { Actions } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { dialogConfirmMTA, dialogOpenMTA } from '../../dialog/state/dialog.actions';
import { UploadContainerComponent } from './upload-container.component';

describe('UploadContainerComponent', () => {
    let store: { dispatch: jest.Mock };
    let actions$: Subject<Action>;
    let component: UploadContainerComponent;
    let fileChooserOpened: boolean[];

    function createComponent(): UploadContainerComponent {
        const created = new UploadContainerComponent(
            store as unknown as Store,
            actions$ as unknown as Actions
        );
        created.ngOnInit();
        return created;
    }

    /** The target the component put on the dialog it just opened. */
    function dispatchedDialogTarget(): string {
        const open = store.dispatch.mock.calls
            .map(call => call[0])
            .find(action => action.type === dialogOpenMTA.type);
        return open.target;
    }

    beforeEach(() => {
        store = { dispatch: jest.fn() };
        actions$ = new Subject<Action>();
        component = createComponent();
        fileChooserOpened = [];
        component.trigger$.subscribe(opened => fileChooserOpened.push(opened));
    });

    it('opens the file chooser straight away when nothing would be lost', () => {
        component.guard({});

        expect(fileChooserOpened).toEqual([true]);
        expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('asks for confirmation first when a confirm message is set', () => {
        component.confirmMessage = 'Changes will be lost. Continue?';

        component.guard({});

        expect(fileChooserOpened).toEqual([]);
        expect(store.dispatch).toHaveBeenCalledWith(dialogOpenMTA({
            target: dispatchedDialogTarget(),
            configuration: {
                title: 'Schließen',
                message: 'Changes will be lost. Continue?',
                confirmButtonConfig: { label: 'Ok' },
                cancelButtonConfig: { label: 'Abbrechen' },
                warnings: []
            }
        }));
    });

    it('opens the file chooser once its own dialog is confirmed', () => {
        component.confirmMessage = 'Continue?';
        component.guard({});

        actions$.next(dialogConfirmMTA({ target: dispatchedDialogTarget() }));

        expect(fileChooserOpened).toEqual([true]);
    });

    it('leaves the file chooser closed when the dialog is cancelled', () => {
        component.confirmMessage = 'Continue?';
        component.guard({});

        // Cancelling dispatches no confirm action, so nothing follows.
        expect(fileChooserOpened).toEqual([]);
    });

    it('ignores a confirmation meant for another dialog', () => {
        component.confirmMessage = 'Continue?';
        component.guard({});

        actions$.next(dialogConfirmMTA({ target: 'Some/Other/Dialog' }));

        expect(fileChooserOpened).toEqual([]);
    });

    it('does not open a sibling container\'s file chooser', () => {
        // The action bar and the upload page each hold a container, and both
        // listen on the same action stream.
        const sibling = createComponent();
        const siblingOpened: boolean[] = [];
        sibling.trigger$.subscribe(opened => siblingOpened.push(opened));

        component.confirmMessage = 'Continue?';
        component.guard({});
        actions$.next(dialogConfirmMTA({ target: dispatchedDialogTarget() }));

        expect(fileChooserOpened).toEqual([true]);
        expect(siblingOpened).toEqual([]);
    });

    it('stops listening once destroyed', () => {
        component.confirmMessage = 'Continue?';
        component.guard({});
        const target = dispatchedDialogTarget();

        component.ngOnDestroy();
        actions$.next(dialogConfirmMTA({ target: target }));

        expect(fileChooserOpened).toEqual([]);
    });
});
