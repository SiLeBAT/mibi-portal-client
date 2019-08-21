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
            sampleMeta: this.toSampleMeta(dto.sampleMeta)
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
            nrl: this.fromNRLStringToEnum(dto.nrl)
        };
    }

    private fromNRLStringToEnum(nrlStirng: string): NRL {
        switch (nrlStirng.trim()) {
            case 'NRL Überwachung von Bakterien in zweischaligen Weichtieren':
            case 'NRL-Vibrio':
                return NRL.NRL_Vibrio;
            case 'NRL Escherichia coli einschließlich verotoxinbildende E. coli':
            case 'NRL Verotoxinbildende Escherichia coli':
            case 'NRL-VTEC':
                return NRL.NRL_VTEC;
            case 'Bacillus spp.':
                return NRL.L_Bacillus;
            case 'Clostridium spp. (C. difficile)':
                return NRL.L_Clostridium;
            case 'NRL koagulasepositive Staphylokokken einschließlich Staphylococcus aureus':
            case 'NRL-Staph':
                return NRL.NRL_Staph;
            case 'NRL Salmonellen (Durchführung von Analysen und Tests auf Zoonosen)':
            case 'NRL-Salm':
                return NRL.NRL_Salm;
            case 'NRL Listeria monocytogenes':
            case 'NRL-Listeria':
                return NRL.NRL_Listeria;
            case 'NRL Campylobacter':
            case 'NRL-Campy':
                return NRL.NRL_Campy;
            case 'NRL Antibiotikaresistenz':
            case 'NRL-AR':
                return NRL.NRL_AR;
            case 'Yersinia':
            case 'KL-Yersinia':
                return NRL.KL_Yersinia;
            case 'NRL-Trichinella':
            case 'NRL Trichinella':
                return NRL.NRL_Trichinella;
            case 'NRL Überwachung von Viren in zweischaligen Weichtieren':
            case 'NRL-Virus':
                return NRL.NRL_Virus;
            case 'Leptospira':
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
