import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
    this.registerForm = new FormGroup({
      firstName: new FormControl(null, Validators.required),
      lastName: new FormControl(null, Validators.required),
      email: new FormControl(null, [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl(null, Validators.required),
    });
  }

  register() {
    this.loading = true;

    const user = new User(
      this.registerForm.value.email,
      this.registerForm.value.password,
      this.registerForm.value.firstName,
      this.registerForm.value.lastName,
    );

    this.userService.create(user)
      .subscribe((data) => {
        console.log('success: ', data);
        this.alertService.success('Registration successful', true);
        this.router.navigate(['user/login']);
      }, (error) => {
        console.error('error: ', error);
        this.alertService.error(error);
        this.loading = false;
      });

    this.registerForm.reset();
  }

}
