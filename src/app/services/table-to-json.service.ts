import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { ISampleCollectionDTO, ISampleDTO } from './excel-to-json.service';

@Injectable()
export class TableToJsonService {

    constructor() { }

    fromTableToDTO(data: any[]): ISampleCollectionDTO {
        // console.log('fromTableToDTO, data: ', data);
        const sampleList: ISampleDTO[] = [];

        _.forEach(data, (sample, i) => {
            sampleList[i] = sample;
        });

        const dto: ISampleCollectionDTO = {
            data: sampleList
        };

        return dto;
    }

}
