import { Injectable } from '@angular/core';
import _ from 'lodash-es';
import {
    Sample,
    SampleSet,
    SampleSetMetaData,
    SampleData,
    SampleMeta
} from '../../samples/model/sample-management.model';
import {
    AnnotatedSampleSetDTO,
    AnnotatedOrderDTO,
    SampleSetMetaDTO,
    SampleSetDTO,
    SampleDataDTO,
    OrderDTO,
    SampleDTO,
    AnnotatedSampleDTO,
    AnnotatedSampleDataDTO,
    SampleMetaDTO
} from '../model/shared-dto.model';
import { SamplesMainData } from '../../samples/state/samples.reducer';

@Injectable({
    providedIn: 'root'
})
export class DTOFactoryService {

    fromSampleSet(sampleSet: SampleSet): SampleSetDTO {
        const dto: SampleSetDTO = {
            meta: this.fromSampleSetMeta(sampleSet.meta),
            samples: sampleSet.samples.map(sample => this.fromSample(sample))
        };
        return dto;
    }

    fromSamplesMainDataToAnnotatedOrderDTO({ meta, sampleData }: SamplesMainData): AnnotatedOrderDTO {
        const dto: AnnotatedSampleSetDTO = this.fromSampleSetToAnnotatedDTO({
            meta,
            samples: sampleData
        });
        return { sampleSet: dto };
    }

    fromSamplesMainDataToOrderDTO({ meta, sampleData }: SamplesMainData): OrderDTO {
        const dto: SampleSetDTO = this.fromSampleSet({
            meta,
            samples: sampleData
        });
        return { sampleSet: dto };
    }

    private fromSample(sample: Sample): SampleDTO {
        return {
            sampleData: this.fromSampleData(sample.sampleData),
            sampleMeta: this.fromSampleMeta(sample.sampleMeta)
        };
    }

    private fromSampleData(sampleData: SampleData): SampleDataDTO {
        const dto: Partial<SampleDataDTO> = {};
        Object.keys(sampleData).forEach((prop: keyof SampleData) => dto[prop] = {
            value: sampleData[prop].value,
            oldValue: sampleData[prop].oldValue
        });
        return dto as SampleDataDTO;
    }

    private fromSampleMeta(sampleMeta: SampleMeta): SampleMetaDTO {
        return {
            nrl: sampleMeta.nrl,
            analysis: sampleMeta.analysis,
            urgency: sampleMeta.urgency
        };
    }

    private fromSampleSetMeta(meta: SampleSetMetaData): SampleSetMetaDTO {
        return {
            sender: meta.sender,
            fileName: meta.fileName,
            customerRefNumber: meta.customerRefNumber,
            signatureDate: meta.signatureDate
        };
    }

    private fromSampleSetToAnnotatedDTO(sampleSet: SampleSet): AnnotatedSampleSetDTO {
        return {
            samples: sampleSet.samples.map(
                sample => this.fromSampleToAnnotatedDTO(sample)
            ),
            meta: this.fromSampleSetMeta(sampleSet.meta)
        };
    }

    private fromSampleToAnnotatedDTO(sample: Sample): AnnotatedSampleDTO {
        return {
            sampleData: this.fromSampleDataToAnnotatedDTO(sample.sampleData),
            sampleMeta: this.fromSampleMeta(sample.sampleMeta)
        };
    }

    private fromSampleDataToAnnotatedDTO(sampleData: SampleData): AnnotatedSampleDataDTO {
        const dto: Partial<AnnotatedSampleDataDTO> = {};
        Object.keys(sampleData).forEach((prop: keyof SampleData) => dto[prop] = {
            value: sampleData[prop].value,
            oldValue: sampleData[prop].oldValue,
            errors: sampleData[prop].errors ? sampleData[prop].errors : [],
            correctionOffer: sampleData[prop].correctionOffer ? sampleData[prop].correctionOffer : []
        });
        return dto as AnnotatedSampleDataDTO;
    }
}
