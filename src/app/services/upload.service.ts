import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient, HttpRequest } from "@angular/common/http";
import { ConfirmationService, ConfirmSettings, ResolveEmit } from "@jaspero/ng-confirmations";

import { ITableStructureProvider } from "./json-to-table";

@Injectable()
export class UploadService {
  tableStructureProvider: ITableStructureProvider;

  constructor(private httpClient: HttpClient,
              private router: Router,
              private confirmationService: ConfirmationService) {}

  uploadFile(sendableFormData: FormData) {
    const postUrl = "api/v1/upload";
    const req = new HttpRequest("POST", postUrl, sendableFormData, {
      reportProgress: true
    });

    return this.httpClient.request(req);
  }

  onUpload() {
    if (this.isValidationActive()) {
      const options: ConfirmSettings = {
        overlay: true,
        overlayClickToClose: false,
        showCloseButton: true,
        confirmText: 'Ok',
        declineText: 'Cancel'
      }

      this.confirmationService
        .create(
          "Upload",
          `<p>Möchten Sie Ihre Daten verwerfen und andere Probendaten hochladen?</p>`,
          options
        )
        .subscribe((ans: ResolveEmit) => {
          if (ans.resolved) {
            this.router.navigate(["/upload"]);
          }
        });
    } else {
      this.router.navigate(["/upload"]);
    }

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
