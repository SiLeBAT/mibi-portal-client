import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { UserService } from './../services/user.service';
import { AlertService } from './../services/alert.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private registerForm: FormGroup;
  loading = false;

  constructor(
    private userService: UserService,
    private alertService: AlertService,
    private router: Router) {}

  ngOnInit() {
    this.loadInstitutions();
    this.registerForm = new FormGroup({
      firstName: new FormControl(null, Validators.required),
      lastName: new FormControl(null, Validators.required),
      email: new FormControl(null, [
        Validators.required,
        Validators.email
      ]),
      password1: new FormControl(null, Validators.required),
      password2: new FormControl(null, Validators.required),
    });
  }

  private loadInstitutions() {
    // this.userService.getAll()
    // .subscribe((data) => {
    //   this.alertService.success(data['title']);
    //   this.users = data['obj'];
    // }, (err: HttpErrorResponse) => {
    //   try {
    //     const errObj = JSON.parse(err.error);
    //     console.log('error loadAllUsers: ', errObj);
    //     this.alertService.error(errObj.title);
    //   } catch (e) {}
    // });
  }

  register() {
    this.loading = true;

    const user = new User(
      this.registerForm.value.email,
      this.registerForm.value.password1,
      this.registerForm.value.firstName,
      this.registerForm.value.lastName,
    );

    this.userService.create(user)
      .subscribe((data) => {
        this.alertService.success(data['title'], true);
        this.router.navigate(['users/login']);
      }, (err: HttpErrorResponse) => {
        const errObj = JSON.parse(err.error);
        this.alertService.error(errObj.title, true);
        this.loading = false;
      });

    this.registerForm.reset();
  }

}
