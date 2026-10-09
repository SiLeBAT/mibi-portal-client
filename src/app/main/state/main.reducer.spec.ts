import { routerNavigationAction } from '@ngrx/router-store';
import { ActionBarItem } from '../action-bar/action-bar.model';
import {
    configureActionBarSOA,
    hideActionBarSOA,
    updateActionBarTitleSOA
} from './action-bar.actions';
import { mainActionBarReducer } from './main.reducer';

const item = (id: string): ActionBarItem => ({
    kind: 'button',
    id: id,
    label: id,
    icon: 'icon'
});

const initial = mainActionBarReducer(undefined, { type: 'init' });

describe('mainActionBarReducer', () => {

    it('starts out disabled, untitled and empty', () => {
        expect(initial).toEqual({ isEnabled: false, title: '', items: [] });
    });

    it('enables the bar with the configured title and items', () => {
        const state = mainActionBarReducer(
            initial,
            configureActionBarSOA({ title: 'file.xlsx', items: [item('a')] })
        );

        expect(state).toEqual({
            isEnabled: true,
            title: 'file.xlsx',
            items: [item('a')]
        });
    });

    it('replaces the items of an earlier configuration rather than adding to them', () => {
        const configured = mainActionBarReducer(
            initial,
            configureActionBarSOA({ title: 'first', items: [item('a'), item('b')] })
        );

        const state = mainActionBarReducer(
            configured,
            configureActionBarSOA({ title: 'second', items: [item('c')] })
        );

        expect(state.items).toEqual([item('c')]);
        expect(state.title).toBe('second');
    });

    it('updates the title without touching the items', () => {
        const configured = mainActionBarReducer(
            initial,
            configureActionBarSOA({ title: 'before', items: [item('a')] })
        );

        const state = mainActionBarReducer(
            configured,
            updateActionBarTitleSOA({ title: 'after' })
        );

        expect(state.title).toBe('after');
        expect(state.items).toEqual([item('a')]);
        expect(state.isEnabled).toBe(true);
    });

    it('clears the bar when it is hidden', () => {
        const configured = mainActionBarReducer(
            initial,
            configureActionBarSOA({ title: 'file.xlsx', items: [item('a')] })
        );

        expect(mainActionBarReducer(configured, hideActionBarSOA())).toEqual(initial);
    });

    // The bar belongs to the page that configured it: leaving the page must not
    // leave its actions behind on the next one.
    it('clears the bar on navigation', () => {
        const configured = mainActionBarReducer(
            initial,
            configureActionBarSOA({ title: 'file.xlsx', items: [item('a')] })
        );

        const state = mainActionBarReducer(
            configured,
            routerNavigationAction({ payload: {} as never })
        );

        expect(state).toEqual(initial);
    });
});
