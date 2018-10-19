import { SampleData } from '../../samples/model/sample-management.model';

interface IValidationRequestMetaInformation {
    state: string;
    nrl: string;
}

export interface IValidationRequest {
    data: SampleData[];
    meta: IValidationRequestMetaInformation;
}
