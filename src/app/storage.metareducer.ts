/*
https://medium.com/better-programming/sync-your-state-in-local-storage-with-ngrx-9d6ceba93fc0
*/

import {ActionReducer, Action} from '@ngrx/store';
import {merge, pick} from 'lodash';

function setSavedState(state: any, localStorageKey: string) {
  sessionStorage.setItem(localStorageKey, JSON.stringify(state));
}
function getSavedState(localStorageKey: string): any {
    const data = sessionStorage.getItem(localStorageKey);
    if(data === null) {
        return null;
    }
  return JSON.parse(data);
}

// the keys from state which we'd like to save.
const stateKeys = ['samples', 'user.currentUser'];
// the key for the local storage.
const localStorageKey = '__app_storage__';

export function storageMetaReducer<S, A extends Action = Action> (reducer: ActionReducer<S, A>) {
    console.log('metareducer: ', reducer)
  let onInit = true; // after load/refresh…
  return function(state: S, action: A): S {
    // reduce the nextState.
    const nextState = reducer(state, action);
    // init the application state.
    if (onInit) {
      onInit           = false;
      const savedState = getSavedState(localStorageKey);
      return merge(nextState, savedState);
    }
    // save the next state to the application storage.
    const stateToSave = pick(nextState, stateKeys);
    setSavedState(stateToSave, localStorageKey);
    return nextState;
  };
}