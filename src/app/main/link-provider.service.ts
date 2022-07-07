import { Injectable } from '@angular/core';
import { mainPaths } from './main.paths';


@Injectable({
    providedIn: 'root'
})
export class MainLinkProviderService {
    get home(): string { return mainPaths.home; }
}
