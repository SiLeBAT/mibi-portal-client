import { createFeatureSelector, MemoizedSelector } from '@ngrx/store';

/**
 * Creates the feature selector for one store slice, typed with both the state
 * it reads from and the state it selects.
 *
 * Both type arguments matter. `createFeatureSelector<T>(name)` -- the single
 * argument form -- returns `MemoizedSelector<object, T>`, so every selector
 * derived from it accepts *any* object as its source state. A selector meant
 * for one slice then type checks against an unrelated store, and the mismatch
 * only shows up at runtime as `undefined` state. Naming the slice as the
 * source state instead ties the whole derived selector tree to a store that
 * actually carries that slice, and `createSelector` propagates it from here.
 *
 * The two argument `createFeatureSelector` overload is deprecated upstream in
 * favour of `createFeature`, which would mean restructuring every reducer
 * registration. Until that migration happens this is the only form that
 * constrains the source state, so the deprecation is accepted deliberately and
 * confined to this one call. Do not drop the first type argument.
 *
 * `store-selector-typing.spec.ts` fails to compile if that guarantee is lost.
 */
export function createSliceSelector<Slice extends object, T>(
    sliceName: keyof Slice & string
): MemoizedSelector<Slice, T> {
    return createFeatureSelector<Slice, T>(sliceName);
}
