import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { UserService } from './../services/user.service';
import { AlertService } from './../services/alert.service';
import { User } from '../../models/user.model';
import { Institution } from '../../models/institution.model';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private registerForm: FormGroup;
  loading = false;
  institutions: Institution[] = [];

  constructor(
    private userService: UserService,
    private alertService: AlertService,
    private router: Router) {}

  ngOnInit() {
    console.log('RegisterComponent ngOnInit() called');
    this.loadInstitutions();
    this.registerForm = new FormGroup({
      institution: new FormControl('0', Validators.required),
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

  getInstitutionName(institution: Institution): string {
    let name = institution.name1;
    if (institution.name2.length > 0) {
      name = name + ', ' + institution.name2;
    }
    name = name + ', ' + institution.location;
    return name;
  }

  loadInstitutions() {
    this.userService.getAllInstitutions()
    .subscribe((data) => {
      for (const entry of data as Array<any>) {
        const institution = new Institution(entry);
        // console.log('institution: ', institution);
        this.institutions.push(institution);
      }
    }, (err: HttpErrorResponse) => {
      try {
        const errObj = JSON.parse(err.error);
        console.log('error loadInstitutions: ', errObj);
        this.alertService.error(errObj.title);
      } catch (e) {}
    });
  }

  register() {
    this.loading = true;

    console.log('this.registerForm.value.institution: ', this.registerForm.value.institution);

    const user = new User(
      this.registerForm.value.email,
      this.registerForm.value.password1,
      this.registerForm.value.firstName,
      this.registerForm.value.lastName,
    );
    user.institution_id = this.registerForm.value.institution;

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
