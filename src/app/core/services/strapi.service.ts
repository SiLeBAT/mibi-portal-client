import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface WelcomePageData {
    isMaintenance: boolean;
    content: string;
}

interface StrapiWelcomePageResponse {
    data: {
        is_maintenance_mode: boolean;
        content: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class StrapiService {

    private readonly CMS_API = environment.cmsApiUrl;

    constructor(private httpClient: HttpClient) {}

    getWelcomePage(): Observable<WelcomePageData | null> {
        return this.httpClient
            .get<StrapiWelcomePageResponse>(`${this.CMS_API}/mibi-welcome`)
            .pipe(
                map(response => ({
                    isMaintenance: response.data.is_maintenance_mode ?? false,
                    content: response.data.content ?? ''
                })),
                catchError(() => of(null))
            );
    }
}
