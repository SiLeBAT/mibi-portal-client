
import { SampleData, Sample, SampleMeta } from './../../samples/model/sample-management.model';
import { Injectable } from '@angular/core';
import _ from 'lodash';
import {
    SampleSet,
    MarshalledData,
    AnnotatedSampleDataEntry,
    SampleProperty,
    SampleSetMetaData
} from '../../samples/model/sample-management.model';
import {
    PutSamplesXLSXResponseDTO
} from '../model/response.model';
import { ClientError } from '../model/client-error';
import {
    AnnotatedSampleDataDTO,
    AnnotatedSampleDataEntryDTO,
    SampleSetMetaDTO,
    SampleSetDTO,
    SampleDTO,
    SampleMetaDTO
} from '../model/shared-dto.model';
import { Urgency, NRL } from '../../samples/model/sample.enums';

@Injectable({
    providedIn: 'root'
})
export class EntityFactoryService {

    toSample(dto: SampleDTO): Sample {
        return {
            sampleData: this.toSampleData(dto.sampleData),
            sampleMeta: dto.sampleMeta ? this.toSampleMeta(dto.sampleMeta) : {
                nrl: NRL.UNKNOWN,
                analysis: {},
                urgency: Urgency.NORMAL
            }
        };
    }

    toSampleSet(dto: SampleSetDTO): SampleSet {
        const annotatedSampleSet: SampleSet = {
            meta: this.toSampleSetMetaData(dto.meta),
            samples: dto.samples.map(sample => this.toSample(sample))
        };
        return annotatedSampleSet;
    }

    fromPutSamplesXLSXResponseDTOToMarshalledData(dto: PutSamplesXLSXResponseDTO): MarshalledData {
        return {
            binaryData: dto.data,
            mimeType: dto.type,
            fileName: dto.fileName
        };
    }

    private toSampleData(dto: AnnotatedSampleDataDTO): SampleData {
        const annotatedSampleData: Partial<SampleData> = {};
        Object.keys(dto).forEach((prop: SampleProperty) => annotatedSampleData[prop] = this.toAnnotatedSampleDataEntry(dto[prop]));
        return annotatedSampleData as SampleData;
    }

    private toSampleMeta(dto: SampleMetaDTO): SampleMeta {
        return {
            nrl: dto.nrl ? this.fromNRLStringToEnum(dto.nrl) : NRL.UNKNOWN,
            analysis: dto.analysis,
            urgency: dto.urgency ? this.fromUrgencyStringToEnum(dto.urgency) : Urgency.NORMAL
        };
    }

    private fromNRLStringToEnum(nrlString: string): NRL {
        switch (nrlString.trim()) {
            case 'KL-Vibrio':
                return NRL.KL_Vibrio;
            case 'NRL-VTEC':
                return NRL.NRL_VTEC;
            case 'L-Bacillus':
                return NRL.L_Bacillus;
            case 'L-Clostridium':
                return NRL.L_Clostridium;
            case 'NRL-Staph':
                return NRL.NRL_Staph;
            case 'NRL-Salm':
                return NRL.NRL_Salm;
            case 'NRL-Listeria':
                return NRL.NRL_Listeria;
            case 'NRL-Campy':
                return NRL.NRL_Campy;
            case 'NRL-AR':
                return NRL.NRL_AR;
            case 'KL-Yersinia':
                return NRL.KL_Yersinia;
            case 'NRL-Trichinella':
                return NRL.NRL_Trichinella;
            case 'Labor nicht erkannt':
            default:
                return NRL.UNKNOWN;
        }
    }

    private toSampleSetMetaData(dto: SampleSetMetaDTO): SampleSetMetaData {
        return {
            sender: dto.sender,
            fileName: dto.fileName ? dto.fileName : '',
            customerRefNumber: dto.customerRefNumber ? dto.customerRefNumber : '',
            signatureDate: dto.signatureDate ? dto.signatureDate : '',
            version: dto.version ? dto.version : ''
        };
    }

    private fromUrgencyStringToEnum(str: string): Urgency {
        switch (str.trim().toLowerCase()) {
            case 'eilt':
                return Urgency.URGENT;
            case 'normal':
            default:
                return Urgency.NORMAL;
        }
    }

    private toAnnotatedSampleDataEntry(dto: AnnotatedSampleDataEntryDTO): AnnotatedSampleDataEntry {
        try {
            const annotatedSampleDataEntry: AnnotatedSampleDataEntry = {
                value: dto.value,
                errors: dto.errors ? dto.errors : [],
                correctionOffer: dto.correctionOffer ? dto.correctionOffer : []
            };

            if (!_.isNil(dto.oldValue)) {
                annotatedSampleDataEntry.oldValue = dto.oldValue;
            }

            return annotatedSampleDataEntry;
        } catch (error) {
            throw new ClientError(
                `Error parsing input. error=${error}`
            );
        }
    }
}
