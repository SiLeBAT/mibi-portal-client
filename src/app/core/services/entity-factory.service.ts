import { SampleData, Sample, SampleMeta } from './../../samples/model/sample-management.model';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
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

    constructor() {
    }

    toSample(dto: SampleDTO): Sample {
        return {
            sampleData: this.toSampleData(dto.sampleData),
            sampleMeta: dto.sampleMeta ? this.toSampleMeta(dto.sampleMeta) : { nrl: NRL.UNKNOWN }
        };
    }

    toSampleSet(dto: SampleSetDTO): SampleSet {
        const annotatedSampleSet: SampleSet = {
            meta: this.toSampleSetMetaData(dto.meta),
            samples: dto.samples.map(sample => {
                return this.toSample(sample);
            })
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
        const annotatedSampleData: Record<SampleProperty, AnnotatedSampleDataEntry> = {};
        Object.keys(dto).forEach(prop => annotatedSampleData[prop] = this.toAnnotatedSampleDataEntry(dto[prop]));
        return annotatedSampleData as SampleData;
    }

    private toSampleMeta(dto: SampleMetaDTO): SampleMeta {
        return {
            nrl: dto.nrl ? this.fromNRLStringToEnum(dto.nrl) : NRL.UNKNOWN
        };
    }

    private fromNRLStringToEnum(nrlString: string): NRL {
        switch (nrlString.trim()) {
            case 'NRL-Vibrio':
                return NRL.NRL_Vibrio;
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
            case 'NRL-Virus':
                return NRL.NRL_Virus;
            case 'KL-Leptospira':
                return NRL.KL_Leptospira;
            case 'Labor nicht erkannt':
            default:
                return NRL.UNKNOWN;
        }
    }

    private toSampleSetMetaData(dto: SampleSetMetaDTO): SampleSetMetaData {
        return {
            nrl: this.fromNRLStringToEnum(dto.nrl),
            analysis: dto.analysis,
            sender: dto.sender,
            urgency: this.fromUrgencyStringToEnum(dto.urgency),
            fileName: dto.fileName ? dto.fileName : ''
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
