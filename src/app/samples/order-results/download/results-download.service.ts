import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { OrderEntryDTO } from '../../../core/model/response.model';
import { LogService } from '../../../core/services/log.service';
import { parseOrderDate } from '../../../orders/model/order-date';
import { derivePathogenTabs, filterSamplesByPathogen } from '../results-grid/pathogen-catalog';
import { buildResultsCsv, downloadColumnsForPathogen } from './results-csv';

@Injectable({
    providedIn: 'root'
})
export class ResultsDownloadService {

    constructor(private readonly logger: LogService) {}

    // "Angezeigter Erreger": the currently shown pathogen's results as one CSV.
    downloadDisplayedPathogen(order: OrderEntryDTO, pathogenId: string): void {
        const samples = order.samples ?? [];
        const csv = buildResultsCsv(
            downloadColumnsForPathogen(pathogenId),
            filterSamplesByPathogen(samples, pathogenId)
        );
        const token = derivePathogenTabs(samples).find(tab => tab.id === pathogenId)?.fileToken ?? pathogenId;
        saveAs(this.csvBlob(csv), this.csvFileName(order, token));
    }

    // "Alle Erreger dieses Auftrags": a ZIP with one CSV per present pathogen.
    downloadAllPathogens(order: OrderEntryDTO): void {
        const samples = order.samples ?? [];
        const zip = new JSZip();
        for (const pathogen of derivePathogenTabs(samples)) {
            const csv = buildResultsCsv(
                downloadColumnsForPathogen(pathogen.id),
                filterSamplesByPathogen(samples, pathogen.id)
            );
            zip.file(this.csvFileName(order, pathogen.fileToken), csv);
        }
        zip.generateAsync({ type: 'blob' })
            .then(blob => saveAs(blob, this.zipFileName(order)))
            .catch((error: Error) => this.logger.error('Failed to build results ZIP file', error?.stack));
    }

    private csvBlob(csv: string): Blob {
        return new Blob([csv], { type: 'text/csv;charset=utf-8' });
    }

    // BfR-Probenanalyse_Auftrag{YYYYMMDD}-{HHmm}_{filenameWithoutExt}
    private baseName(order: OrderEntryDTO): string {
        return `BfR-Probenanalyse_Auftrag${this.formatTimestamp(order.createdAt)}_${this.stripExtension(order.fileName ?? '')}`;
    }

    private csvFileName(order: OrderEntryDTO, token: string): string {
        return `${this.baseName(order)}_${token}.csv`;
    }

    private zipFileName(order: OrderEntryDTO): string {
        return `${this.baseName(order)}.zip`;
    }

    private stripExtension(fileName: string): string {
        const dot = fileName.lastIndexOf('.');
        return dot > 0 ? fileName.slice(0, dot) : fileName;
    }

    private formatTimestamp(raw: unknown): string {
        const date = parseOrderDate(raw) ?? new Date();
        const pad = (value: number): string => value.toString().padStart(2, '0');
        return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
            `-${pad(date.getHours())}${pad(date.getMinutes())}`;
    }
}
