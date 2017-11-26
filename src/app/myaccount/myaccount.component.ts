import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-myaccount',
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.css']
})
export class MyaccountComponent implements OnInit {

  constructor(private router: Router) { }

    ngOnInit() {
    }

  addUserData() {
  this.router.navigateByUrl('/userdata');
  }
}
