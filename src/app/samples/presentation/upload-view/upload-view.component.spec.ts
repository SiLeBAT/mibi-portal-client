import { Actions } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { BehaviorSubject, Subject } from 'rxjs';
import {
    dialogCancelMTA,
    dialogConfirmMTA,
    dialogOpenMTA
} from '../../../shared/dialog/state/dialog.actions';
import { closeSamplesConfirmDialogStrings } from '../../close-samples/close-samples.constants';
import { importSamplesMSA } from '../../import-samples/import-samples.actions';
import { SamplesMainSlice } from '../../samples.state';
import { UploadViewComponent } from './upload-view.component';

/** Matches the target the component opens its confirm dialog with. */
const CONFIRM_TARGET = 'Samples/UploadView/ReplaceConfirm';

describe('UploadViewComponent', () => {
    let hasEntries$: BehaviorSubject<boolean>;
    let store: { dispatch: jest.Mock; pipe: jest.Mock };
    let actions$: Subject<Action>;
    let component: UploadViewComponent;
    let file: File;

    /**
     * The files the component asked to import, in order. Jest compares File
     * objects structurally and every File looks alike to it, so the assertions
     * below check references rather than matching whole actions.
     */
    function importedFiles(): File[] {
        return store.dispatch.mock.calls
            .map(call => call[0])
            .filter(action => action.type === importSamplesMSA.type)
            .map(action => action.excelFile.file as File);
    }

    function openedDialogs(): Action[] {
        return store.dispatch.mock.calls
            .map(call => call[0])
            .filter(action => action.type === dialogOpenMTA.type);
    }

    beforeEach(() => {
        hasEntries$ = new BehaviorSubject<boolean>(false);
        store = {
            dispatch: jest.fn(),
            // The component only ever pipes to read `selectHasEntries`.
            pipe: jest.fn(() => hasEntries$)
        };
        actions$ = new Subject<Action>();
        component = new UploadViewComponent(
            store as unknown as Store<SamplesMainSlice>,
            actions$ as unknown as Actions
        );
        component.ngOnInit();
        file = new File(['x'], 'samples.xlsx');
    });

    it('imports straight away when no samples are loaded', () => {
        hasEntries$.next(false);

        component.fileUpload(file);

        expect(importedFiles()).toHaveLength(1);
        expect(importedFiles()[0]).toBe(file);
        expect(openedDialogs()).toHaveLength(0);
    });

    it('asks for confirmation instead of replacing loaded samples', () => {
        hasEntries$.next(true);

        component.fileUpload(file);

        const strings = closeSamplesConfirmDialogStrings;
        expect(store.dispatch).toHaveBeenCalledWith(dialogOpenMTA({
            target: CONFIRM_TARGET,
            configuration: {
                title: strings.title,
                message: strings.message,
                confirmButtonConfig: { label: strings.confirmButtonLabel },
                cancelButtonConfig: { label: strings.cancelButtonLabel },
                warnings: []
            }
        }));
        expect(importedFiles()).toHaveLength(0);
    });

    it('imports the file it was holding once the user confirms', () => {
        hasEntries$.next(true);
        component.fileUpload(file);

        actions$.next(dialogConfirmMTA({ target: CONFIRM_TARGET }));

        expect(importedFiles()).toHaveLength(1);
        expect(importedFiles()[0]).toBe(file);
    });

    it('imports nothing when the user cancels', () => {
        hasEntries$.next(true);
        component.fileUpload(file);

        actions$.next(dialogCancelMTA({ target: CONFIRM_TARGET }));

        expect(importedFiles()).toHaveLength(0);
    });

    it('forgets a cancelled file, so a later confirmation imports nothing', () => {
        hasEntries$.next(true);
        component.fileUpload(file);
        actions$.next(dialogCancelMTA({ target: CONFIRM_TARGET }));

        // A stray confirmation must not resurrect the abandoned file.
        actions$.next(dialogConfirmMTA({ target: CONFIRM_TARGET }));

        expect(importedFiles()).toHaveLength(0);
    });

    it('imports only the most recent file when asked twice', () => {
        const newer = new File(['y'], 'newer.xlsx');
        hasEntries$.next(true);
        component.fileUpload(file);
        component.fileUpload(newer);

        actions$.next(dialogConfirmMTA({ target: CONFIRM_TARGET }));

        expect(importedFiles()).toHaveLength(1);
        expect(importedFiles()[0]).toBe(newer);
    });

    it('imports only once, however many confirmations arrive', () => {
        hasEntries$.next(true);
        component.fileUpload(file);

        actions$.next(dialogConfirmMTA({ target: CONFIRM_TARGET }));
        actions$.next(dialogConfirmMTA({ target: CONFIRM_TARGET }));

        expect(importedFiles()).toHaveLength(1);
    });

    it('ignores a confirmation meant for another dialog', () => {
        hasEntries$.next(true);
        component.fileUpload(file);

        actions$.next(dialogConfirmMTA({ target: 'Some/Other/Dialog' }));

        expect(importedFiles()).toHaveLength(0);
    });

    it('stops listening once destroyed', () => {
        hasEntries$.next(true);
        component.fileUpload(file);

        component.ngOnDestroy();
        actions$.next(dialogConfirmMTA({ target: CONFIRM_TARGET }));

        expect(importedFiles()).toHaveLength(0);
    });
});
