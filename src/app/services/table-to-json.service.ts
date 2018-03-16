import { Injectable } from '@angular/core';
import * as _ from 'lodash';

import { IKnimeData } from '../upload/upload.component';
import { ISampleCollectionDTO, ISampleDTO } from './excel-to-json.service';



@Injectable()
export class TableToJsonService {

  constructor() {}

  fromTableToDTO(data: IKnimeData[]): ISampleCollectionDTO {
    // console.log('fromTableToDTO, data: ', data);
    let sampleList: ISampleDTO[] = [];

    _.forEach(data, (sample, i) => {
      sampleList[i] = sample;
    });

    let dto: ISampleCollectionDTO = {
      data: sampleList
    }

    return dto;
  }


}
