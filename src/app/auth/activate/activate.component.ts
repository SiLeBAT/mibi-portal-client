import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { UserService } from '../services/user.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.css']
})
export class ActivateComponent implements OnInit {
  private activateForm: FormGroup;
  tokenValid: boolean;

  constructor(private activatedRoute: ActivatedRoute,
              private userService: UserService,
              private alertService: AlertService,
            private router: Router) { }

  ngOnInit() {
    const token = this.activatedRoute.snapshot.params['id'];
    console.log('ActivateComponent ngOnInit, token: ', token);

    this.userService.activateAccount(token)
      .subscribe((data) => {
        console.log('activate account data: ', data);
        const message = data['title'];
        this.alertService.success(message, true);
        this.tokenValid = true;
      }, (err: HttpErrorResponse) => {
        const errObj = JSON.parse(err.error);
        this.alertService.error(errObj.title, true);
        this.tokenValid = false;
      });

  }

  continue() {
    this.router.navigate(['users/login']);
  }

}
