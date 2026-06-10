import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Faq, FaqSection } from '../../main/faq/faq.model';

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

interface StrapiFaqSection {
    id: number;
    title: string;
    url: string;
    Priority?: number | null;
}

interface StrapiFaqEntry {
    id: number;
    question: string;
    answer: string;
    isTop: boolean;
    Priority?: number | null;
    section: StrapiFaqSection | null;
}

interface StrapiFaqResponse {
    data: StrapiFaqEntry[];
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

    getFaq(): Observable<Faq | null> {
        return this.httpClient
            .get<StrapiFaqResponse>(`${this.CMS_API}/faq-entries?populate=section&pagination[limit]=100&sort=id:asc`)
            .pipe(
                map(response => this.mapFaq(response.data)),
                catchError(() => of(null))
            );
    }

    private mapFaq(entries: StrapiFaqEntry[]): Faq | null {
        if (entries.length === 0) {
            return null;
        }

        const byPriority = (a: { Priority?: number | null }, b: { Priority?: number | null }) => {
            if (a.Priority == null && b.Priority == null) { return 0; }
            if (a.Priority == null) { return 1; }
            if (b.Priority == null) { return -1; }
            return a.Priority - b.Priority;
        };

        const topEntries = entries
            .filter(e => e.isTop)
            .sort(byPriority)
            .map(e => ({ question: e.question, answer: e.answer }));

        const sectionMap = new Map<number, { section: StrapiFaqSection; entries: StrapiFaqEntry[] }>();
        for (const entry of entries) {
            if (!entry.isTop && entry.section) {
                if (!sectionMap.has(entry.section.id)) {
                    sectionMap.set(entry.section.id, { section: entry.section, entries: [] });
                }
                sectionMap.get(entry.section.id)!.entries.push(entry);
            }
        }

        const sections: FaqSection[] = [...sectionMap.values()]
            .sort((a, b) => byPriority(a.section, b.section))
            .map(({ section, entries: sectionEntries }) => ({
                title: section.title,
                urlFragment: section.url,
                entries: sectionEntries
                    .sort(byPriority)
                    .map(e => ({ question: e.question, answer: e.answer }))
            }));

        return { topEntries: topEntries, sections: sections };
    }
}
