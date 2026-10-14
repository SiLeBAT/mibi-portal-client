import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { OrderEntryDTO, ResultDataDTO, SampleWithResultsDTO } from '../../../core/model/response.model';
import { LogService } from '../../../core/services/log.service';
import { NRL } from '../../../samples/model/sample.enums';
import { ResultsDownloadService } from './results-download.service';
import { required } from '../../../shared/model/invariant';

jest.mock('file-saver');

const saveAsMock = saveAs as jest.MockedFunction<typeof saveAs>;

const salmonellaSample = (): SampleWithResultsDTO =>
    ({
        sampleData: { pathogen_avv: { value: 'Salmonella' } },
        sampleMeta: { nrl: NRL.NRL_Salm },
        results: []
    }) as unknown as SampleWithResultsDTO;

const order = (createdAt: Date, fileName: string): OrderEntryDTO =>
    ({ id: 'o1', createdAt: createdAt, fileName: fileName, samples: [salmonellaSample()] }) as unknown as OrderEntryDTO;

describe('ResultsDownloadService.downloadDisplayed', () => {
    let service: ResultsDownloadService;

    beforeEach(() => {
        saveAsMock.mockClear();
        service = new ResultsDownloadService({ error: jest.fn() } as unknown as LogService);
    });

    it('saves the CSV with the ticket #786 filename (date-time, filename, NRL name)', () => {
        // Local components so the formatting is timezone-independent.
        service.downloadDisplayed(order(new Date(2026, 5, 25, 9, 24), 'V18_Test.xlsx'), NRL.NRL_Salm);

        expect(saveAsMock).toHaveBeenCalledTimes(1);
        expect(required(saveAsMock.mock.calls[0], 'saveAs call')[0]).toBeInstanceOf(Blob);
        expect(required(saveAsMock.mock.calls[0], 'saveAs call')[1]).toBe('BfR-Probenanalyse_Auftrag20260625-0924_V18_Test_NRL-Salm.csv');
    });

    it('zero-pads the month, day, hour and minute', () => {
        service.downloadDisplayed(order(new Date(2026, 0, 5, 7, 3), 'V18_Test.xlsx'), NRL.NRL_Salm);
        expect(required(saveAsMock.mock.calls[0], 'saveAs call')[1]).toBe('BfR-Probenanalyse_Auftrag20260105-0703_V18_Test_NRL-Salm.csv');
    });

    it('strips only the last file extension, and leaves a name without an extension untouched', () => {
        service.downloadDisplayed(order(new Date(2026, 5, 25, 9, 24), 'my.report.xlsx'), NRL.NRL_Salm);
        expect(required(saveAsMock.mock.calls[0], 'saveAs call')[1]).toContain('_my.report_NRL-Salm.csv');

        saveAsMock.mockClear();
        service.downloadDisplayed(order(new Date(2026, 5, 25, 9, 24), 'report'), NRL.NRL_Salm);
        expect(required(saveAsMock.mock.calls[0], 'saveAs call')[1]).toContain('_report_NRL-Salm.csv');
    });
});

describe('ResultsDownloadService.downloadAll', () => {
    let service: ResultsDownloadService;
    let logger: { error: jest.Mock };

    beforeEach(() => {
        saveAsMock.mockClear();
        logger = { error: jest.fn() };
        service = new ResultsDownloadService(logger as unknown as LogService);
    });

    // KL-Yersinia and NRL-Staph deliver numeric values (e.g. "Biotyp": 4,
    // "MHK CIP": 0.5) and null; one such NRL used to abort the whole ZIP.
    it('saves a ZIP with one CSV per NRL, named after the NRL, also for numeric values', async () => {
        const nrlSample = (nrl: NRL, resultData: ResultDataDTO): SampleWithResultsDTO =>
            ({
                sampleData: {},
                sampleMeta: { nrl: nrl },
                results: [{ id: 'r1', position: 1, resultData: resultData }]
            }) as unknown as SampleWithResultsDTO;
        const entry = {
            ...order(new Date(2026, 5, 25, 9, 24), 'V18_Test.xlsx'),
            samples: [
                nrlSample(NRL.KL_Yersinia, { Biotyp: 4 }),
                nrlSample(NRL.NRL_Staph, { 'MHK CIP': 0.5, 'MHK LZD': null })
            ]
        } as OrderEntryDTO;

        service.downloadAll(entry);
        await waitFor(() => saveAsMock.mock.calls.length > 0);

        expect(logger.error).not.toHaveBeenCalled();
        const [blob, zipName] = required(saveAsMock.mock.calls[0], 'saveAs call');
        expect(zipName).toBe('BfR-Probenanalyse_Auftrag20260625-0924_V18_Test.zip');
        const zip = await JSZip.loadAsync(blob as Blob);
        expect(Object.keys(zip.files).sort()).toEqual([
            'BfR-Probenanalyse_Auftrag20260625-0924_V18_Test_KL-Yersinia.csv',
            'BfR-Probenanalyse_Auftrag20260625-0924_V18_Test_NRL-Staph.csv'
        ]);
        const yersiniaCsv = await required(
            zip.file('BfR-Probenanalyse_Auftrag20260625-0924_V18_Test_KL-Yersinia.csv') ?? undefined, 'Yersinia CSV'
        ).async('string');
        expect(yersiniaCsv).toContain('"4"');
    });
});

async function waitFor(condition: () => boolean): Promise<void> {
    for (let attempt = 0; attempt < 100 && !condition(); attempt++) {
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}
