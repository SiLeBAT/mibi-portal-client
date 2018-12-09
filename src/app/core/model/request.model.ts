import { SampleData } from '../../samples/model/sample-management.model';

interface ValidationRequestMetaInformation {
    state: string;
    nrl: string;
}

export interface ValidationRequest {
    data: SampleData[];
    meta: ValidationRequestMetaInformation;
}
