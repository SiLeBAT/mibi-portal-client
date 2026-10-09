import { Action } from '@ngrx/store';
import { EMPTY } from 'rxjs';
import { ActionBarComponent } from './action-bar.component';
import { ActionBarItem } from './action-bar.model';

const componentWith = () => {
    const dispatched: Action[] = [];
    const store$ = {
        // The component only reads the observables in its template, which is
        // not rendered here; the dispatches are what these tests check.
        select: () => EMPTY,
        dispatch: (action: Action) => dispatched.push(action)
    };
    return { component: new ActionBarComponent(store$ as never), dispatched: dispatched };
};

const menuItem = (entries: { entryId: string; label: string }[]): ActionBarItem => ({
    kind: 'menu',
    id: 'feature/menu',
    label: 'Menu',
    entries: entries
});

const buttonItem: ActionBarItem = {
    kind: 'button',
    id: 'feature/button',
    label: 'Button'
};

describe('ActionBarComponent', () => {

    describe('menuEntries', () => {
        it('returns the entries of a menu item', () => {
            const { component } = componentWith();
            expect(component.menuEntries(menuItem([{ entryId: 'a', label: 'A' }])))
                .toEqual([{ entryId: 'a', label: 'A' }]);
        });

        it('returns nothing for an item that is not a menu', () => {
            const { component } = componentWith();
            expect(component.menuEntries(buttonItem)).toEqual([]);
        });
    });

    describe('onSingleMenuEntrySelected', () => {
        // A menu holding one entry is rendered as a plain link.
        it('reports the only entry', () => {
            const { component, dispatched } = componentWith();

            component.onSingleMenuEntrySelected(menuItem([{ entryId: 'only', label: 'Only' }]));

            expect(dispatched).toEqual([
                expect.objectContaining({ id: 'feature/menu', entryId: 'only' })
            ]);
        });

        // Guards the index lookup: an empty menu must not dispatch anything.
        it('reports nothing when the menu is empty', () => {
            const { component, dispatched } = componentWith();

            component.onSingleMenuEntrySelected(menuItem([]));

            expect(dispatched).toEqual([]);
        });

        it('reports nothing for an item that is not a menu', () => {
            const { component, dispatched } = componentWith();

            component.onSingleMenuEntrySelected(buttonItem);

            expect(dispatched).toEqual([]);
        });
    });

    describe('confirmMessageOf', () => {
        it('returns the confirmation of an upload item', () => {
            const { component } = componentWith();
            expect(component.confirmMessageOf({
                kind: 'upload',
                id: 'feature/upload',
                label: 'Upload',
                confirmMessage: 'Sure?'
            })).toBe('Sure?');
        });

        it('returns nothing for an item that is not an upload', () => {
            const { component } = componentWith();
            expect(component.confirmMessageOf(buttonItem)).toBeUndefined();
        });
    });
});
