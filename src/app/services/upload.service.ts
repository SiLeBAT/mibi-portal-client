import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient, HttpRequest } from "@angular/common/http";

import { ITableStructureProvider } from "./json-to-table";

@Injectable()
export class UploadService {
  tableStructureProvider: ITableStructureProvider;

  constructor(private httpClient: HttpClient,
              private router: Router) {}

  uploadFile(sendableFormData: FormData) {
    const postUrl = "api/v1/upload";
    const req = new HttpRequest("POST", postUrl, sendableFormData, {
      reportProgress: true
    });

    return this.httpClient.request(req);
  }

  onUpload() {
    this.router.navigate(["/upload"]);

  }

  setCurrentTableStructureProvider(
    tableStructureProvider: ITableStructureProvider
  ) {
    this.tableStructureProvider = tableStructureProvider;
  }

  getCurrentTableStructureProvider(): ITableStructureProvider {
    return this.tableStructureProvider;
  }

  isValidationActive() {
    return this.tableStructureProvider !== undefined;
  }
}
