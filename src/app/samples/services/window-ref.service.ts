import { Injectable } from '@angular/core';

function getWindow(): Window & typeof globalThis {
    return window;
}

@Injectable({
    providedIn: 'root'
})
export class WindowRefService {

    get nativeWindow(): Window & typeof globalThis {
        return getWindow();
    }

}
