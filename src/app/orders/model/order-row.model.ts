export interface OrderRow {
    id: string;
    createdAt: Date;
    fileName: string;
    /** All sample numbers of the order. Filtered and sorted on. */
    sampleIds: string;
    /** The sample numbers as shown in the cell - cut off after ten values. */
    sampleIdsDisplay: string;
    /** All AVV DatA sample numbers of the order. Filtered and sorted on. */
    sampleIdsAVV: string;
    /** The AVV DatA sample numbers as shown in the cell - cut off after ten values. */
    sampleIdsAVVDisplay: string;
    pathogens: string;
    nrls: string;
    sampleCount: number;
    results: string;
}
