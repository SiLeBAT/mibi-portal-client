import { Injectable } from '@angular/core';
import moment from 'moment';
import 'moment/locale/de';
import { CellObject, read, utils, WorkBook, WorkSheet } from 'xlsx';
import {
    DATE_FIELDS,
    DEFAULT_SAMPLE_DATA_HEADER_ROW,
    EXCEL_RANGE,
    FORM_PROPERTIES,
    META_ANALYSIS_COMPAREHUMAN_BOOL_CELL,
    META_ANALYSIS_COMPAREHUMAN_TEXT_CELL,
    META_ANALYSIS_ESBLAMPCCARBAPENEMASEN_CELL,
    META_ANALYSIS_MOLECULARTYPING_CELL,
    META_ANALYSIS_OTHER_TEXT_CELL,
    META_ANALYSIS_RESISTANCE_CELL,
    META_ANALYSIS_SEROLOGICAL_CELL,
    META_ANALYSIS_SPECIES_CELL,
    META_ANALYSIS_TOXIN_CELL,
    META_ANALYSIS_VACCINATION_CELL,
    META_ANAYLSIS_OTHER_BOOL_CELL,
    META_CUSTOMER_REF_NUMBER_CELL,
    META_EXCEL_VERSION,
    META_NRL_CELL,
    META_SENDER_CONTACTPERSON_CELL,
    META_SENDER_DEPARTMENT_CELL,
    META_SENDER_EMAIL_CELL,
    META_SENDER_INSTITUTENAME_CELL,
    META_SENDER_STREET_CELL,
    META_SENDER_TELEPHONE_CELL,
    META_SENDER_ZIP_CITY_CELL,
    META_SIGNATURE_DATE_CELL,
    META_URGENCY_CELL,
    SAMPLE_DATA_HEADER_ROW_MARKER,
    VALID_SHEET_NAME
} from './excel-parser.constants';
import {
    ParsedAddress,
    ParsedAnalysisOption,
    ParsedSample,
    ParsedSampleDataEntry,
    ParsedSampleSheet,
    ParsedSampleSheetAnalysis,
    ParsedSampleSheetMeta,
    ParsedUrgency
} from './excel-parser.model';

/**
 * Browser-side conversion of a BfR sample-sheet .xlsx into JSON (MPS-312).
 *
 * This is a faithful port of the cloud `ExcelUnmarshalService` "read spreadsheet"
 * job. The NRL enrichment job stays on the server, so this deliberately does NOT
 * assign per-sample nrl/analysis/urgency — the cloud fills those in.
 */
@Injectable({ providedIn: 'root' })
export class ExcelParserService {
    async parse(file: File): Promise<ParsedSampleSheet> {
        const workSheet = await this.fromFileToWorkSheet(file);
        const samples = this.fromWorksheetToData(workSheet);
        const meta = this.getMetaDataFromFileData(workSheet, file.name);

        return { samples: samples, meta: meta };
    }

    private async fromFileToWorkSheet(file: File): Promise<WorkSheet> {
        const buffer = await file.arrayBuffer();
        const workbook: WorkBook = read(new Uint8Array(buffer), {
            type: 'array',
            cellDates: true, // write date as JS-Date to 'v' field, sets 't' field to 'd'
            cellText: true, // write formatted text to 'w' field
            cellStyles: false, // write style to 's' field
            cellNF: false // write number format string to 'z' field
        });
        const worksheetName: string = workbook.SheetNames[0];
        const workSheet: WorkSheet = workbook.Sheets[worksheetName];
        if (worksheetName !== VALID_SHEET_NAME) {
            throw new Error(
                `Not a valid excel sheet, name of first sheet must be ${VALID_SHEET_NAME}`
            );
        }
        return workSheet;
    }

    // Typed accessor for a single cell. Indexing a WorkSheet yields `any`, so this
    // narrows it once and keeps the call sites type-safe.
    private getCell(workSheet: WorkSheet, ref: string): CellObject {
        return workSheet[ref] as CellObject;
    }

    private getMetaDataFromFileData(
        workSheet: WorkSheet,
        fileName: string
    ): ParsedSampleSheetMeta {
        return {
            nrl: this.getNRLFromWorkSheet(workSheet),
            urgency: this.getUrgencyFromWorkSheet(workSheet),
            sender: this.getSenderFromWorkSheet(workSheet),
            analysis: this.getAnalysisFromWorkSheet(workSheet),
            fileName: fileName,
            customerRefNumber: this.getStringFromCell(
                this.getCell(workSheet, META_CUSTOMER_REF_NUMBER_CELL)
            ),
            signatureDate: this.getStringFromCell(
                this.getCell(workSheet, META_SIGNATURE_DATE_CELL)
            ),
            version: this.getStringFromCell(
                this.getCell(workSheet, META_EXCEL_VERSION)
            ).slice(1)
        };
    }

    private getAnalysisFromWorkSheet(
        workSheet: WorkSheet
    ): ParsedSampleSheetAnalysis {
        const getOptionFromCell = (ref: string): ParsedAnalysisOption =>
            this.getStringFromCell(this.getCell(workSheet, ref)) !== ''
                ? ParsedAnalysisOption.ACTIVE
                : ParsedAnalysisOption.OMIT;

        return {
            species: getOptionFromCell(META_ANALYSIS_SPECIES_CELL),
            serological: getOptionFromCell(META_ANALYSIS_SEROLOGICAL_CELL),
            resistance: getOptionFromCell(META_ANALYSIS_RESISTANCE_CELL),
            vaccination: getOptionFromCell(META_ANALYSIS_VACCINATION_CELL),
            molecularTyping: getOptionFromCell(META_ANALYSIS_MOLECULARTYPING_CELL),
            toxin: getOptionFromCell(META_ANALYSIS_TOXIN_CELL),
            esblAmpCCarbapenemasen: getOptionFromCell(
                META_ANALYSIS_ESBLAMPCCARBAPENEMASEN_CELL
            ),
            other: getOptionFromCell(META_ANAYLSIS_OTHER_BOOL_CELL),
            otherText: this.getStringFromCell(
                this.getCell(workSheet, META_ANALYSIS_OTHER_TEXT_CELL)
            ),
            compareHuman: getOptionFromCell(META_ANALYSIS_COMPAREHUMAN_BOOL_CELL),
            compareHumanText: this.getStringFromCell(
                this.getCell(workSheet, META_ANALYSIS_COMPAREHUMAN_TEXT_CELL)
            )
        };
    }

    private getSenderFromWorkSheet(workSheet: WorkSheet): ParsedAddress {
        return {
            instituteName: this.getStringFromCell(
                this.getCell(workSheet, META_SENDER_INSTITUTENAME_CELL)
            ),
            department: this.getStringFromCell(
                this.getCell(workSheet, META_SENDER_DEPARTMENT_CELL)
            ),
            street: this.getStringFromCell(
                this.getCell(workSheet, META_SENDER_STREET_CELL)
            ),
            zipCity: this.getStringFromCell(
                this.getCell(workSheet, META_SENDER_ZIP_CITY_CELL)
            ).trim(),
            contactPerson: this.getStringFromCell(
                this.getCell(workSheet, META_SENDER_CONTACTPERSON_CELL)
            ),
            telephone: this.getStringFromCell(
                this.getCell(workSheet, META_SENDER_TELEPHONE_CELL)
            ),
            email: this.getStringFromCell(
                this.getCell(workSheet, META_SENDER_EMAIL_CELL)
            )
        };
    }

    private getUrgencyFromWorkSheet(workSheet: WorkSheet): ParsedUrgency {
        const urgency = this.getStringFromCell(
            this.getCell(workSheet, META_URGENCY_CELL)
        );

        switch (urgency.toLowerCase()) {
            case 'eilt':
                return ParsedUrgency.URGENT;
            case 'normal':
            default:
                return ParsedUrgency.NORMAL;
        }
    }

    private getNRLFromWorkSheet(workSheet: WorkSheet): string {
        // The raw NRL string; validation + mapping to an NRL id happens server-side.
        return this.getStringFromCell(this.getCell(workSheet, META_NRL_CELL));
    }

    private getStringFromCell(cell: CellObject): string {
        if (!cell || cell.v === undefined) {
            return '';
        }
        switch (cell.t) {
            case 'b':
                return this.getStringFromBooleanCell(cell);
            case 'e':
                return this.getStringFromErrorCell(cell);
            case 'n':
                return this.getStringFromNumberCell(cell);
            case 'd':
                return this.getStringFromDateCell(cell);
            case 's':
                return (cell.v as string).trim();
            case 'z':
                return '';
        }
        return '';
    }

    private getStringFromBooleanCell(cell: CellObject): string {
        const v = cell.v as boolean;
        return v ? 'WAHR' : 'FALSCH';
    }

    private getStringFromErrorCell(cell: CellObject): string {
        // returns the english error strings
        return cell.w!;
    }

    private getStringFromNumberCell(cell: CellObject): string {
        const v = cell.v as number;
        // number cells are formatted with english rules
        // due to the complexity of convert all the rules to german, all user defined number formats are ignored
        return v.toString().replace('.', ',');
    }

    private getStringFromDateCell(cell: CellObject): string {
        const v = cell.v as Date;

        // date cells are formatted with english rules, so some conversion is necessary to get a german localized string
        // due to the complexity of this task all user defined date formats are ignored
        const localMoment = this.getLocalizedMomentFromDate(v);

        // to check if cell contains a time or a date reparse the cell to excel's serialized date format
        const serializedDate = utils.aoa_to_sheet([[v]], { cellDates: false })[
            'A1'
        ].v as number;

        // excel uses integer part for dates and fractional part for time
        const isTime = serializedDate - Math.floor(serializedDate) !== 0;
        const isDate = serializedDate >= 1;

        // format the date accordingly
        if (isDate && !isTime) {
            return localMoment.format('L');
        } else if (!isDate) {
            return localMoment.format('LTS');
        } else {
            return localMoment.format('L LTS');
        }
    }

    private getLocalizedMomentFromDate(date: Date): moment.Moment {
        // moment does not interpret timezones so some trickery is necessary

        // create moment with given timezone offset
        const offMoment = moment(date);

        // get timezone offset of local timezone
        const localOffset = moment().utcOffset();

        // convert to utc time with offset to local timezone
        let correctMoment = offMoment.utcOffset(localOffset);
        correctMoment = this.correctMomentForXLSXSummerTimeBug(
            correctMoment,
            date
        );

        return correctMoment.locale('de');
    }

    private correctMomentForXLSXSummerTimeBug(
        momentDate: moment.Moment,
        date: Date
    ): moment.Moment {
        // since xlsx v0.16.0 date is in summer time if the date itself lies in summer, instead of local time is in summer

        const localOffset = moment().utcOffset();

        const gmtString = date.toString();
        const gmtIndex = gmtString.indexOf('GMT');
        const hours = Number(gmtString.slice(gmtIndex + 4, gmtIndex + 6));
        const minutes = Number(gmtString.slice(gmtIndex + 6, gmtIndex + 8));
        let parsedOffset = hours * 60 + minutes;
        if (gmtString.slice(gmtIndex + 3, gmtIndex + 4) === '-') {
            parsedOffset = -parsedOffset;
        }

        return momentDate.add(parsedOffset - localOffset, 'minutes');
    }

    private fromWorksheetToData(workSheet: WorkSheet): ParsedSample[] {
        const lineNumber = this.getSampleDataHeaderRow(workSheet);

        // set the range to a defined value to prevent the reading of extremely
        // large range numbers given by the excel sheet
        workSheet['!ref'] = EXCEL_RANGE;

        const data = utils.sheet_to_json<Record<string, string>>(workSheet, {
            header: FORM_PROPERTIES,
            range: lineNumber,
            defval: ''
        });

        const cleanedData = this.fromDataToCleanedSamples(data);
        return this.formatData(cleanedData);
    }

    private formatData(data: Record<string, string>[]): ParsedSample[] {
        return data.map((sample: Record<string, string>) => {
            const annotatedSampleData: Record<string, ParsedSampleDataEntry> =
                {};

            Object.keys(sample).forEach(props => {
                if (this.isDateField(props)) {
                    sample[props] = this.parseDate(sample[props]);
                }
                annotatedSampleData[props] = this.createAnnotatedSampleEntry(
                    sample[props]
                );
            });

            return { data: annotatedSampleData };
        });
    }

    private createAnnotatedSampleEntry(value: string): ParsedSampleDataEntry {
        return {
            value: '' + value,
            errors: [],
            correctionOffer: []
        };
    }

    private parseDate(stringOrDate: string | Date): string {
        const date = stringOrDate.toString();
        try {
            let parsedMoment: moment.Moment;

            // date was given as Date object
            if (date.includes('GMT')) {
                parsedMoment = this.getLocalizedMomentFromDate(new Date(date));
                // date was given as string
            } else {
                const americanDF = /\d\d?\/\d\d?\/\d\d\d?\d?/;
                let dateFormat: string;
                if (americanDF.test(date)) {
                    dateFormat = 'MM/DD/YYYY';
                } else {
                    dateFormat = 'DD.MM.YYYY';
                }
                parsedMoment = moment(date, dateFormat).locale('de');
            }

            if (!parsedMoment.isValid()) {
                return date;
            }
            return parsedMoment.format('DD.MM.YYYY');
        } catch {
            return date;
        }
    }

    private isDateField(field: string): boolean {
        return DATE_FIELDS.includes(field);
    }

    private getSampleDataHeaderRow(workSheet: WorkSheet): number {
        const markerKey = Object.keys(workSheet).find(
            key =>
                this.getCell(workSheet, key).v === SAMPLE_DATA_HEADER_ROW_MARKER
        );
        if (markerKey !== undefined) {
            const row = utils.encode_row(utils.decode_cell(markerKey).r);
            return Number.parseInt(row, 10);
        }
        return DEFAULT_SAMPLE_DATA_HEADER_ROW;
    }

    private fromDataToCleanedSamples(
        data: Record<string, string>[]
    ): Record<string, string>[] {
        return data.filter(
            sampleObj =>
                Object.keys(sampleObj)
                    .map(key => sampleObj[key])
                    .some(item => item !== '')
        );
    }
}
