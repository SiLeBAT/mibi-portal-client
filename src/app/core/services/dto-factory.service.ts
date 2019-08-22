import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import {
    Sample,
    SampleSet,
    SampleSetMetaData,
    SampleData
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
    AnnotatedSampleDataDTO
} from '../model/shared-dto.model';
import { SamplesMainData } from '../../samples/state/samples.reducer';

@Injectable({
    providedIn: 'root'
})
export class DTOFactoryService {

    constructor() {
    }

    fromSampleSet(sampleSet: SampleSet): SampleSetDTO {
        const dto: SampleSetDTO = {
            meta: this.fromSampleSetMeta(sampleSet.meta),
            samples: sampleSet.samples.map(sample => this.fromSample(sample))
        };
        return dto;
    }

    fromSamplesMainDataToAnnotatedOrderDTO({ meta, formData }: SamplesMainData): AnnotatedOrderDTO {
        const dto: AnnotatedSampleSetDTO = this.fromSampleSetToAnnotatedDTO({
            meta,
            samples: formData
        });
        return { sampleSet: dto };
    }

    fromSamplesMainDataToOrderDTO({ meta, formData }: SamplesMainData): OrderDTO {
        const dto: SampleSetDTO = this.fromSampleSet({
            meta,
            samples: formData
        });
        return { sampleSet: dto };
    }

    private fromSample(sample: Sample): SampleDTO {
        return {
            sampleData: this.fromSampleData(sample.sampleData)
        };
    }

    private fromSampleData(sampleData: SampleData): SampleDataDTO {
        const dto: SampleDataDTO = {};
        Object.keys(sampleData).forEach(prop => dto[prop] = {
            value: sampleData[prop].value,
            oldValue: sampleData[prop].oldValue
        });
        return dto;
    }

    private fromSampleSetMeta(meta: SampleSetMetaData): SampleSetMetaDTO {
        return {
            nrl: meta.nrl,
            analysis: meta.analysis,
            sender: meta.sender,
            urgency: meta.urgency
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
            sampleData: this.fromSampleDataToAnnotatedDTO(sample.sampleData)
        };
    }

    private fromSampleDataToAnnotatedDTO(sampleData: SampleData): AnnotatedSampleDataDTO {
        const dto: AnnotatedSampleDataDTO = {};
        Object.keys(sampleData).forEach(prop => dto[prop] = {
            value: sampleData[prop].value,
            oldValue: sampleData[prop].oldValue,
            errors: sampleData[prop].errors ? sampleData[prop].errors : [],
            correctionOffer: sampleData[prop].correctionOffer ? sampleData[prop].correctionOffer : []
        });
        return dto;
    }
}
