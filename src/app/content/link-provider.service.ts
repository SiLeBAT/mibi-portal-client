import { Injectable } from '@angular/core';
import { contentPaths } from './content.paths';

@Injectable({
    providedIn: 'root'
})
export class ContentLinkProviderService {
    get faq(): string { return contentPaths.faq; }
    get dataProtection(): string { return contentPaths.dataProtection; }
}
