import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { UserService } from './../../auth/services/user.service';
import { AlertService } from './../../auth/services/alert.service';
import { User } from './../../models/user.model';
import { UserData } from './../../models/userdata.model';

@Component({
  selector: 'app-userdata',
  templateUrl: './userdata.component.html',
  styleUrls: ['./userdata.component.css']
})
export class UserdataComponent implements OnInit {
  private myaccountForm: FormGroup;
  private currentUser;
  loading = false;

  constructor(
    private userService: UserService,
    private alertService: AlertService,
    private router: Router) {}

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.myaccountForm = new FormGroup({
      firstName: new FormControl(null),
      lastName: new FormControl(null),
      institute: new FormControl(null, Validators.required),
      department: new FormControl(null, Validators.required),
      street: new FormControl(null, Validators.required),
      city: new FormControl(null, Validators.required),
      contact: new FormControl(null, Validators.required),
      phone: new FormControl(null, Validators.required),
      email: new FormControl(null, [
        Validators.required,
        Validators.email
      ])
    });
  }

  getCurrentUser() {
    return this.currentUser;
  }

  saveMyData() {

  console.log('saveMyData clicked');

    // this.loading = true;

    // const user = new User(
    //   this.registerForm.value.email,
    //   this.registerForm.value.password1,
    //   this.registerForm.value.firstName,
    //   this.registerForm.value.lastName,
    // );

    // this.userService.create(user)
    //   .subscribe((data) => {
    //     this.alertService.success(data['title'], true);
    //     this.router.navigate(['users/login']);
    //   }, (err: HttpErrorResponse) => {
    //     const errObj = JSON.parse(err.error);
    //     this.alertService.error(errObj.title, true);
    //     this.loading = false;
    //   });

    // this.registerForm.reset();
  }

}
