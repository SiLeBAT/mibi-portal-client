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
      institute: new FormControl(null),
      department: new FormControl(null),
      street: new FormControl(null),
      city: new FormControl(null),
      contact: new FormControl(null),
      phone: new FormControl(null),
      // email: new FormControl(null, [
      //   Validators.required,
      //   Validators.email
      // ])
      email: new FormControl(null)
    });
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getInstitutionName() {
    const institution = this.getCurrentUser().institution;
    let name = institution.name1;
    if (institution.name2) {
      name = name + ', ' + institution.name2;
    }

    return name;
  }

  saveMyData() {

  console.log('saveMyData clicked');

    this.loading = true;

    console.log('myaccountForm.value.email: ', this.myaccountForm.value.email);
    console.log('this.currentUser.email: ', this.currentUser.email);

    const userData = new UserData(
      this.myaccountForm.value.department,
      this.myaccountForm.value.contact,
      this.myaccountForm.value.phone,
      this.myaccountForm.value.email
    );

    this.userService.addUserData(this.currentUser, userData)
      .subscribe((data) => {
        console.log('addUserdata data: ', data)
        // this.alertService.success(data['title'], true);
        // this.router.navigate(['users/login']);
      }, (err: HttpErrorResponse) => {
        const errObj = JSON.parse(err.error);
        this.alertService.error(errObj.title, true);
        this.loading = false;
      });

    this.myaccountForm.reset();
  }

}
