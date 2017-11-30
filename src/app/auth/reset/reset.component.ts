import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { UserService } from '../services/user.service';
import { AlertService } from '../services/alert.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css']
})
export class ResetComponent implements OnInit {
  private resetForm: FormGroup;
  loading = false;

  constructor(
    private userService: UserService,
    private alertService: AlertService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.resetForm = new FormGroup({
      password1: new FormControl(null, Validators.required),
      password2: new FormControl(null, Validators.required),
    });
  }

  reset() {
    this.loading = true;

    const password = this.resetForm.value.password1;
    const token = this.activatedRoute.snapshot.params['id'];

    console.log('Reset clicked, token: ', token);

    this.userService.resetPassword(password, token)
      .subscribe((data) => {
        console.log('reset password data: ', data);
        const message = data['title'];
        this.alertService.success(message, true);
        this.router.navigate(['users/login']);
      }, (err: HttpErrorResponse) => {
        const errObj = JSON.parse(err.error);
        this.alertService.error(errObj.title, true);
        this.loading = false;
      });

    this.resetForm.reset();
  }



}
