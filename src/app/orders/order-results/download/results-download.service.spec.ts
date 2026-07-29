import { saveAs } from 'file-saver';
import { OrderEntryDTO, SampleWithResultsDTO } from '../../../core/model/response.model';
import { LogService } from '../../../core/services/log.service';
import { ResultsDownloadService } from './results-download.service';

jest.mock('file-saver');

const saveAsMock = saveAs as jest.MockedFunction<typeof saveAs>;

const salmonellaSample = (): SampleWithResultsDTO =>
    ({ sampleData: { pathogen_avv: { value: 'Salmonella' } }, results: [] }) as unknown as SampleWithResultsDTO;

const order = (createdAt: Date, fileName: string): OrderEntryDTO =>
    ({ id: 'o1', createdAt: createdAt, fileName: fileName, samples: [salmonellaSample()] }) as unknown as OrderEntryDTO;

describe('ResultsDownloadService.downloadDisplayedPathogen', () => {
    let service: ResultsDownloadService;

    beforeEach(() => {
        saveAsMock.mockClear();
        service = new ResultsDownloadService({ error: jest.fn() } as unknown as LogService);
    });

    it('saves the CSV with the ticket #786 filename (date-time, filename, pathogen token)', () => {
        // Local components so the formatting is timezone-independent.
        service.downloadDisplayedPathogen(order(new Date(2026, 5, 25, 9, 24), 'V18_Test.xlsx'), 'salmonella');

        expect(saveAsMock).toHaveBeenCalledTimes(1);
        expect(saveAsMock.mock.calls[0][0]).toBeInstanceOf(Blob);
        expect(saveAsMock.mock.calls[0][1]).toBe('BfR-Probenanalyse_Auftrag20260625-0924_V18_Test_Salmonella.csv');
    });

    it('zero-pads the month, day, hour and minute', () => {
        service.downloadDisplayedPathogen(order(new Date(2026, 0, 5, 7, 3), 'V18_Test.xlsx'), 'salmonella');
        expect(saveAsMock.mock.calls[0][1]).toBe('BfR-Probenanalyse_Auftrag20260105-0703_V18_Test_Salmonella.csv');
    });

    it('strips only the last file extension, and leaves a name without an extension untouched', () => {
        service.downloadDisplayedPathogen(order(new Date(2026, 5, 25, 9, 24), 'my.report.xlsx'), 'salmonella');
        expect(saveAsMock.mock.calls[0][1]).toContain('_my.report_Salmonella.csv');

        saveAsMock.mockClear();
        service.downloadDisplayedPathogen(order(new Date(2026, 5, 25, 9, 24), 'report'), 'salmonella');
        expect(saveAsMock.mock.calls[0][1]).toContain('_report_Salmonella.csv');
    });
});
