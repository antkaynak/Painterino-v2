import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  logInForm: FormGroup;
  emailPattern: string = "^[a-zA-Z0-9_!#$%&’*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$";


  constructor(private authService : AuthService, private router: Router) { }

  ngOnInit() {
    this.logInForm = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.pattern(this.emailPattern)]),
      'password': new FormControl(null, Validators.required),
    });
  }

  onSubmitted() {
    const email = this.logInForm.controls.email.value;
    const password = this.logInForm.controls.password.value;
    this.authService.logIn(email, password).subscribe(res => {
      this.router.navigate(['/lobby/rooms']);
    });
  }

}
