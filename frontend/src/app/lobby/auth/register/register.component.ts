import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import * as PasswordValidators from "../../../services/validators/password.validator";
import {AuthService} from "../../../services/auth.service";
import {Router} from "@angular/router";


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  emailPattern: string = "^[a-zA-Z0-9_!#$%&’*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$";


  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.registerForm = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.pattern(this.emailPattern)]),
      'username': new FormControl(null, Validators.required),
      'passwordGroup': new FormGroup({
        'password': new FormControl(null, [Validators.required, Validators.minLength(6)]),
        'passwordConfirm': new FormControl(null, [Validators.required, Validators.minLength(6)]),
      }, PasswordValidators.passwordMatchCheckValidator.bind(this))
    });
  }

  onSubmitted(){
    console.log('submitted');
    const email = this.registerForm.value.email;
    const username = this.registerForm.value.username;
    const password = this.registerForm.value.passwordGroup.password;
    const passwordConfirm = this.registerForm.value.passwordGroup.passwordConfirm;
    console.log(email);
    console.log(password);
    this.authService.register(email, username,password,passwordConfirm).subscribe(res => {
      console.log(res);
      this.router.navigate(['/rooms']);
    });
  }

}
