import { Injectable } from '@angular/core';
import { samplesPaths } from './samples.paths';

@Injectable({
    providedIn: 'root'
})
export class SamplesLinkProviderService {
    get upload(): string { return samplesPaths.upload; }
    get editor(): string { return samplesPaths.editor; }
    get viewer(): string { return samplesPaths.viewer; }
}
