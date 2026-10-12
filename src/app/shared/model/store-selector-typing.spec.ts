import { Selector } from '@ngrx/store';
import { ContentMainSlice } from '../../content/content.state';
import { selectMasterData } from '../../content/state/content.selectors';
import { CoreMainSlice } from '../../core/core.state';
import { selectIsBusy } from '../../core/state/core.selectors';
import { MainMainSlice } from '../../main/main.state';
import { selectActionBarConfig } from '../../main/state/action-bar.selectors';
import { OrdersMainSlice } from '../../orders/orders.state';
import { selectOrderList } from '../../orders/state/order-list.selectors';
import { SamplesMainSlice, SamplesSlice } from '../../samples/samples.state';
import { SendSamplesState } from '../../samples/send-samples/state/send-samples.reducer';
import { selectSendSamplesIsFileAlreadySent } from '../../samples/send-samples/state/send-samples.selectors';
import { samplesMainReducer } from '../../samples/state/samples.reducer';
import { selectSampleData, selectSamplesMainState } from '../../samples/state/samples.selectors';
import { UserMainSlice } from '../../user/user.state';
import { selectUserCurrentUser } from '../../user/state/user.selectors';
import { SharedSlice } from '../shared.state';
import { DialogState } from '../dialog/state/dialog.reducer';
import { selectDialogData } from '../dialog/state/dialog.selectors';
import { NrlState } from '../nrl/state/nrl.reducer';
import { selectNrls } from '../nrl/state/nrl.selectors';

/**
 * Compile-time guard for MPC-182.
 *
 * A selector built on an untyped feature selector has `object` as its source
 * state, which makes it usable on any store and turns a wrong slice into a
 * runtime `undefined` instead of a compile error. The assertions below only
 * hold while every feature selector names its slice as the source state, so
 * this file stops compiling -- and `npm test` fails -- if that is ever lost.
 *
 * ts-jest reports type errors as suite failures, so the `@ts-expect-error`
 * directives are checked rather than decorative: should one of those calls
 * start to type check, the directive becomes unused and compilation fails.
 */

/**
 * Asserts at compile time that the selector may read from `Source`; the call
 * itself does nothing. Mirrors what `Store<Source>.select` accepts.
 */
function usableOn<Source>(_selector: Selector<Source, unknown>): void {
    // The assertion is the type check on the argument, so there is nothing to run.
}

/** True only for types that are mutually assignable, so `object` will not pass. */
type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type Expect<T extends true> = T;

/** The state a selector reads from. */
type SourceStateOf<S> = S extends (state: infer Source, ...rest: never[]) => unknown
    ? Source
    : never;

// --- Each feature selector is anchored to its own slice, not to `object`. ---

export type AssertSamplesSource = Expect<
    Equals<SourceStateOf<typeof selectSamplesMainState>, SamplesMainSlice>
>;
export type AssertDerivedKeepsSource = Expect<
    Equals<SourceStateOf<typeof selectSampleData>, SamplesMainSlice>
>;

// --- A selector type checks against the store that carries its slice... ---

usableOn<ContentMainSlice>(selectMasterData);
usableOn<CoreMainSlice>(selectIsBusy);
usableOn<MainMainSlice>(selectActionBarConfig);
usableOn<OrdersMainSlice>(selectOrderList);
usableOn<SamplesMainSlice>(selectSampleData);
usableOn<UserMainSlice>(selectUserCurrentUser);
usableOn<SharedSlice<NrlState>>(selectNrls);
usableOn<SharedSlice<DialogState>>(selectDialogData);

// ...and against a store that carries that slice among others.
usableOn<SamplesMainSlice & UserMainSlice & CoreMainSlice>(selectSampleData);

// A selector combining two slices needs both of them present.
usableOn<SamplesMainSlice & SamplesSlice<SendSamplesState>>(
    selectSendSamplesIsFileAlreadySent
);

// --- ...and nowhere else. Each of these must stay a compile error. ---

// @ts-expect-error - a state that carries no slice at all
usableOn<{ unrelated: number }>(selectSampleData);
// @ts-expect-error - the bare feature state is not the slice that holds it
usableOn<SamplesMainSlice['samples']>(selectSampleData);
// @ts-expect-error - `object` is what an untyped feature selector would allow
usableOn<object>(selectSampleData);
// @ts-expect-error - a foreign slice, even a well formed one
usableOn<UserMainSlice>(selectSampleData);
// @ts-expect-error - right slice name, wrong feature state underneath it
usableOn<SamplesSlice<SendSamplesState>>(selectSampleData);
// @ts-expect-error - only one half of a selector spanning two slices
usableOn<SamplesMainSlice>(selectSendSamplesIsFileAlreadySent);

describe('store selector typing', () => {
    it('reads the feature state out of its own slice', () => {
        // Guards the slice names the types above are built on: a selector that
        // type checks but looks under the wrong key would return undefined.
        const mainData = samplesMainReducer(undefined, { type: '@@init' });
        const state: SamplesMainSlice = { samples: { mainData: mainData } };

        expect(selectSamplesMainState(state)).toBe(state.samples);
        expect(selectSampleData(state)).toBe(mainData.sampleData);
    });
});
