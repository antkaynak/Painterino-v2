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
      'email': new FormControl("test@email.com", [Validators.required, Validators.pattern(this.emailPattern)]),
      'password': new FormControl("test123", Validators.required),
    });
  }

  onSubmitted() {
    console.log('submitted');
    const email = this.logInForm.controls.email.value;
    const password = this.logInForm.controls.password.value;
    console.log(email);
    console.log(password);
    this.authService.logIn(email, password).subscribe(res => {
      console.log(res);
      this.router.navigate(['/rooms']);
    });
  }

}
